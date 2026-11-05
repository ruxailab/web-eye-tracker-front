// Uses the existing Vue/Babel dependencies and Node assertions (including Node 14).
const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const babel = require('@babel/core');
const compiler = require('vue-template-compiler');
const Vue = require('vue');
const Vuex = require('vuex');

Vue.use(Vuex);
Vue.config.productionTip = false;
Vue.config.devtools = false;

function load(relativePath, mocks = {}, globals = {}) {
  const filename = path.join(__dirname, '..', relativePath);
  const source = fs.readFileSync(filename, 'utf8');
  const component = filename.endsWith('.vue') ? compiler.parseComponent(source) : null;
  const { code } = babel.transformSync(component ? component.script.content : source, {
    filename,
    configFile: false,
    babelrc: false,
    plugins: ['@babel/plugin-transform-modules-commonjs'],
  });
  const exports = {};
  const bindings = {
    exports,
    require(name) {
      if (Object.prototype.hasOwnProperty.call(mocks, name)) return mocks[name];
      throw new Error(`Unexpected import: ${name}`);
    },
    console,
    ...globals,
  };
  // Keep the host's Object prototype: Firestore rejects plain data from other VM realms.
  vm.compileFunction(code, Object.keys(bindings), { filename })(...Object.values(bindings));
  if (component) {
    Object.assign(exports.default, compiler.compileToFunctions(component.template.content));
  }
  return exports.default;
}

const configModal = load('src/components/calibration/ConfigModal.vue', {
  '@/components/general/Slider.vue': {},
});
const postCalibration = load('src/views/PostCalibration.vue', {
  '@/components/calibration/PointModal.vue': {},
  '@/components/general/DraggableFloatingButton.vue': {},
  '@/components/calibration/ConfigModal.vue': configModal,
});

function deferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

function setup({ firebase, refresh = () => Promise.resolve() } = {}) {
  const timers = new Map();
  const writes = [];
  const routes = [];
  const errors = [];
  let refreshes = 0;
  const app = { options: { projectId: 'test-project' } };
  firebase = firebase || {
    apps: [app],
    app: () => app,
    firestore: () => ({
      collection(name) {
        assert.equal(name, 'calibrations');
        return {
          add(data) {
            const write = { ...deferred(), data };
            writes.push(write);
            return write.promise;
          },
        };
      },
    }),
  };
  const calibration = load('src/store/calibration.js', {
    axios: {},
    'firebase/app': firebase,
    'firebase/firestore': {},
    '@/router': {},
  }, {
    console: { error: (...args) => errors.push(args) },
    setTimeout(callback, delay) {
      assert.equal(delay, 15000);
      const id = {};
      timers.set(id, callback);
      return id;
    },
    clearTimeout: id => timers.delete(id),
  });
  const store = new Vuex.Store({
    modules: {
      calibration: {
        ...calibration,
        actions: {
          ...calibration.actions,
          getAllCalibs() { refreshes++; return refresh(); },
        },
      },
    },
  });
  const router = { push: route => { routes.push(route); return Promise.resolve(); } };
  function createView() {
    return new Vue({
      ...postCalibration,
      store,
      // Canvas drawing is unrelated to saving and requires a browser DOM.
      methods: { ...postCalibration.methods, drawCalibPoints() {} },
      beforeCreate() { this.$router = router; },
    });
  }
  return {
    store, firebase, writes, routes, errors, timers, router, createView,
    view: createView(),
    refreshes: () => refreshes,
    expire() { for (const callback of [...timers.values()]) callback(); },
  };
}

function findNode(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.children || []) {
    const match = findNode(child, predicate);
    if (match) return match;
  }
}

// Render the real templates to VNodes to verify prop wiring and button bindings.
function checkUi(h, saving, errorPattern) {
  assert.equal(h.view.savingCalib, saving);
  const modalNode = findNode(h.view._render(), node =>
    node.componentOptions && node.componentOptions.tag === 'ConfigModal');
  const modal = new Vue({ ...configModal, store: h.store, propsData: modalNode.componentOptions.propsData });
  const tree = modal._render();
  for (const label of ['SAVE', 'RECALIB', 'CLOSE', 'EXIT']) {
    const button = findNode(tree, node => node.tag === 'v-btn' &&
      (node.children || []).some(child => child.text === label));
    const dashboardDisabled = h.store.state.calibration.fromDashboard && ['SAVE', 'RECALIB'].includes(label);
    assert.equal(button.data.attrs.disabled, saving || dashboardDisabled, label);
    if (label === 'SAVE') assert.equal(button.data.attrs.loading, saving);
  }
  const alert = findNode(tree, node => node.tag === 'v-alert');
  if (errorPattern) {
    assert.match(h.view.saveError, errorPattern);
    assert.equal(alert.data.attrs.role, 'alert');
    assert.equal(alert.children[0].text, h.view.saveError);
  } else {
    assert.equal(h.view.saveError, '');
    assert.equal(alert, undefined);
  }
  modal.$destroy();
}

const tests = [];
const test = (name, run) => tests.push({ name, run });

test('missing Firebase app or project ID restores controls and shows configuration feedback', async () => {
  for (const firebase of [
    { apps: [] },
    { apps: [{}], app: () => ({ options: { projectId: '' } }) },
  ]) {
    const h = setup({ firebase });
    await h.view.saveCalib();
    checkUi(h, false, /Firebase is not configured/);
    assert.equal(h.routes.length, 0);
    assert.equal(h.timers.size, 0);
  }
});

test('the installed Firebase SDK with empty environment values fails promptly before starting a write', async () => {
  const firebase = require('firebase/app');
  const app = firebase.initializeApp({ projectId: '', apiKey: '' });
  try {
    const h = setup({ firebase });
    await h.view.saveCalib();
    checkUi(h, false, /Firebase is not configured/);
    assert.equal(h.routes.length, 0);
    assert.equal(h.timers.size, 0);
  } finally {
    await app.delete();
  }
});

test('synchronous Firestore setup errors restore controls and allow retry', async () => {
  const h = setup();
  const firestore = h.firebase.firestore;
  h.firebase.firestore = () => { throw new Error('Firestore unavailable'); };
  await h.view.saveCalib();
  checkUi(h, false, /Could not save/);
  h.firebase.firestore = firestore;
  const retry = h.view.saveCalib();
  h.writes[0].resolve({ id: 'saved' });
  await retry;
  checkUi(h, false);
  assert.deepEqual(h.routes, ['/dashboard']);
});

test('success preserves the payload, refreshes the list, and navigates only after acknowledgement', async () => {
  const h = setup();
  const saving = h.view.saveCalib();
  checkUi(h, true);
  assert.equal(h.routes.length, 0);
  assert.equal(h.writes[0].data.calibrations, undefined);
  const expected = { ...h.store.state.calibration };
  delete expected.calibrations;
  assert.equal(JSON.stringify(h.writes[0].data), JSON.stringify(expected));
  await h.view.saveCalib(); // repeated click while saving
  assert.equal(h.writes.length, 1);
  h.writes[0].resolve({ id: 'saved' });
  await saving;
  checkUi(h, false);
  assert.deepEqual(h.routes, ['/dashboard']);
  assert.equal(h.refreshes(), 1);
  assert.equal(h.timers.size, 0);
});

test('rejected writes stay on the page, restore buttons, and permit a fresh retry', async () => {
  for (const code of ['permission-denied', 'unavailable']) {
    const h = setup();
    const saving = h.view.saveCalib();
    h.writes[0].reject(Object.assign(new Error('Write rejected'), { code }));
    await saving;
    checkUi(h, false, code === 'permission-denied' ? /permission/ : /Could not save/);
    assert.equal(h.routes.length, 0);
    assert.equal(h.timers.size, 0);
    const retry = h.view.saveCalib();
    checkUi(h, true);
    assert.equal(h.writes.length, 2);
    h.writes[1].resolve({ id: 'retry' });
    await retry;
    checkUi(h, false);
  }
});

test('timeouts restore controls; repeated retries observe the same write', async () => {
  const h = setup();
  for (let attempt = 0; attempt < 2; attempt++) {
    const saving = h.view.saveCalib();
    checkUi(h, true);
    h.expire();
    await saving;
    checkUi(h, false, /original save may still complete/);
    assert.equal(h.writes.length, 1);
    assert.equal(h.routes.length, 0);
    assert.equal(h.timers.size, 0);
  }
  const retry = h.view.saveCalib();
  h.writes[0].resolve({ id: 'original' });
  await retry;
  checkUi(h, false);
  assert.equal(h.writes.length, 1);
  assert.deepEqual(h.routes, ['/dashboard']);
});

test('late success never navigates automatically or duplicates a save after remount', async () => {
  const h = setup();
  const saving = h.view.saveCalib();
  h.expire();
  await saving;
  h.writes[0].resolve({ id: 'late' });
  await Promise.resolve();
  assert.equal(h.routes.length, 0);
  h.view.$destroy();
  h.view = h.createView();
  await h.view.saveCalib();
  assert.equal(h.writes.length, 1);
  assert.deepEqual(h.routes, ['/dashboard']);
});

test('late rejection is handled and enables a new write on retry', async () => {
  const h = setup();
  const saving = h.view.saveCalib();
  h.expire();
  await saving;
  h.writes[0].reject(new Error('Late rejection'));
  await Promise.resolve();
  const retry = h.view.saveCalib();
  assert.equal(h.writes.length, 2);
  h.writes[1].resolve({ id: 'retry' });
  await retry;
  checkUi(h, false);
});

test('new calibration lifecycle clears write tracking without interference from old writes', async () => {
  for (const mutation of ['setRuntimeData', 'resetRuntime', 'resetAll']) {
    const h = setup();
    const first = h.view.saveCalib();
    h.expire();
    await first;
    h.store.commit(mutation, { circleIrisPoints: [], calibPredictionPoints: [], usedPattern: [] });
    const second = h.view.saveCalib();
    assert.equal(h.writes.length, 2);
    h.writes[0].reject(new Error('Old calibration failed'));
    h.expire();
    await second;
    const retry = h.view.saveCalib();
    assert.equal(h.writes.length, 2);
    h.writes[1].resolve({ id: 'new' });
    await retry;
  }
});

test('list refresh failure or delay does not turn a successful write into failure', async () => {
  for (const refresh of [() => Promise.reject(new Error('Read denied')), () => new Promise(() => {})]) {
    const h = setup({ refresh });
    const saving = h.view.saveCalib();
    h.writes[0].resolve({ id: 'saved' });
    await saving;
    checkUi(h, false);
    assert.deepEqual(h.routes, ['/dashboard']);
    assert.equal(h.timers.size, 0);
  }
});

test('navigation failure reports that saving succeeded and retries navigation without another write', async () => {
  const h = setup();
  const push = h.router.push;
  h.router.push = () => Promise.reject(new Error('Navigation failed'));
  const saving = h.view.saveCalib();
  h.writes[0].resolve({ id: 'saved' });
  await saving;
  checkUi(h, false, /Calibration saved, but/);
  h.router.push = push;
  await h.view.saveCalib();
  checkUi(h, false);
  assert.equal(h.writes.length, 1);
  assert.deepEqual(h.routes, ['/dashboard']);
});

test('dashboard calibrations retain the existing disabled SAVE and RECALIB controls', () => {
  const h = setup();
  h.store.commit('setFromDashboard', true);
  checkUi(h, false);
});

test('the installed Firestore SDK offline keeps one queued write across timeout retries', async () => {
  const firebase = require('firebase/app');
  require('firebase/firestore');
  const app = firebase.initializeApp({ projectId: 'demo-calibration-save-regression' });
  const db = app.firestore();
  // Disable networking before any writes; this test never contacts a Firebase project.
  await db.disableNetwork();
  try {
    const h = setup({ firebase });
    for (let attempt = 0; attempt < 2; attempt++) {
      const saving = h.view.saveCalib();
      h.expire();
      await saving;
      checkUi(h, false, /original save may still complete/);
    }
    const snapshot = await db.collection('calibrations').get({ source: 'cache' });
    assert.equal(snapshot.size, 1);
    assert.equal(snapshot.docs[0].metadata.hasPendingWrites, true);
    assert.equal(h.routes.length, 0);
    assert.equal(h.timers.size, 0);
  } finally {
    await db.terminate();
    await app.delete();
  }
});

(async () => {
  for (const { name, run } of tests) {
    await run();
    console.log(`PASS ${name}`);
  }
  console.log(`\n${tests.length} calibration save regression tests passed.`);
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
