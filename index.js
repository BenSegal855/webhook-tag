const { Plugin } = require('powercord/entities');
const { getModule, React } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');

const Tag = require('./Components/Tag');

module.exports = class WebTag extends Plugin {
  startPlugin () {
    const MessageTimestamp = getModule([ 'MessageTimestamp' ], false);
    const botTagRegularClasses = getModule([ 'botTagRegular' ], false);
    const botTagClasses = getModule([ 'botTagCozy' ], false);
    const remClasses = getModule([ 'rem' ], false);

    inject('webhook-tag', MessageTimestamp, 'default', (args, res) => {
      const msg = args[0].message;

      if (msg.webhookId !== null && msg.messageReference === null) {
        args[0].message.author.bot = false;

        const header = findInReactTree(res, e => Array.isArray(e?.props?.children) && e.props.children.find(c => c?.props?.message));
        header.props.children.push(React.createElement(
          'span',
          {
            className: `${botTagClasses.botTagCozy} ${botTagClasses.botTagCompact} ${botTagRegularClasses.botTagRegular} ${remClasses.rem}`
          },
          React.createElement(Tag, {
            className: botTagRegularClasses.botText
          })
        ));
      }

      return res;
    });
  }

  pluginWillUnload () {
    uninject('webhook-tag');
  }
};
