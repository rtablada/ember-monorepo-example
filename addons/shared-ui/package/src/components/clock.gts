import { resource, cell } from 'ember-resources';
import Component from '@glimmer/component';

const Clock = resource(({ on }) => {
  let time = cell(new Date());
  let interval = setInterval(() => (time.current = new Date()), 1000);

  on.cleanup(() => clearInterval(interval));

  return time;
});

export default class Hello extends Component {
  <template>
    It is: <time>{{Clock}}</time>
  </template>
}
