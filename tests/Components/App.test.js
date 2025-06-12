import { render, fireEvent } from '@testing-library/vue';
import App from '@/App.vue';

test('renders and interacts with button', async () => {
  const { getByText } = render(App);
  const button = getByText('Click me');

  await fireEvent.click(button);
  getByText('Clicked!'); // Assert button click changes DOM
});
