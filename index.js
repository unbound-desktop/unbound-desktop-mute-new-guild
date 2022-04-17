import Plugin from '@structures/plugin';

import { Dispatcher } from '@webpack/common';
import { filters, bulk } from '@webpack';
import { bindAll } from '@utilities';

const [
   Notifications,
   Guilds,
   Settings
] = bulk(
   filters.byProps('updateGuildNotificationSettings'),
   filters.byProps('restrictedGuilds'),
   filters.byProps('updateRemoteSettings')
);

export default class MuteNewGuild extends Plugin {
   constructor(...args) {
      super(...args);

      bindAll(this, ['handleInvite']);
   }

   start() {
      Dispatcher.subscribe('INVITE_ACCEPT_SUCCESS', this.handleInvite);
   }

   stop() {
      Dispatcher.unsubscribe('INVITE_ACCEPT_SUCCESS', this.handleInvite);
   }

   handleInvite({ invite: { guild: { id } } }) {
      Notifications.updateGuildNotificationSettings(id, {
         muted: true,
         suppress_everyone: false,
         suppress_roles: false,
         mobile_push: true
      });

      const guilds = new Set(Guilds.restrictedGuilds);

      guilds.delete(id);

      Settings.updateRemoteSettings({ restrictedGuilds: Array.from(guilds) });
   }
}