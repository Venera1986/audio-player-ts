import { mount } from 'redom';
import { App } from './app/App';
import './style.css';

const app = new App();
const appRoot = document.getElementById('app') ?? document.body;

mount(appRoot, app);
void app.init();
