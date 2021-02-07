const { Plugin } = require('powercord/entities');
const { getModule, getModuleByDisplayName, React } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');

const Tag = require('./Components/tag');

module.exports = class WebTag extends Plugin {
    async startPlugin() {
        const MessageTimestamp = getModule(['MessageTimestamp'], false);
        const botTagRegularClasses = getModule(['botTagRegular'], false);
        const botTagClasses = getModule(['botTagCozy'], false);
        const remClasses = getModule(['rem'], false);

        inject('webhook-tag-messages', MessageTimestamp, 'default', (args, res) => {
            const msg = args[0].message;

            if (msg.webhookId !== null && msg.messageReference === null && msg.author.discriminator === '0000') {
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

        const AnalyticsContext = await getModuleByDisplayName('AnalyticsContext');
        inject('webhook-tag-popout', AnalyticsContext.prototype, 'renderProvider', (_, res) => {
            const elements = findInReactTree(res, a => Array.isArray(a) && a.find(c => c && c.type && c.type.displayName === 'CustomStatus'));
            if (!elements) return res;

            const { user } = findInReactTree(elements, p => p.user);
            if (user.discriminator !== '0000') return res;

            user.bot = false;

            elements[1].props.children[1].props.children = [
                elements[1].props.children[1].props.children,
                React.createElement(
                    'span',
                    {
                        className: `${botTagClasses.botTagCozy} ${botTagClasses.botTagCompact} ${botTagRegularClasses.botTagRegular} ${remClasses.rem}`
                    },
                    React.createElement(Tag, {
                        className: botTagRegularClasses.botText
                    })
                )
            ]

            return res;
        });
    }

    pluginWillUnload() {
        uninject('webhook-tag-messages');
        uninject('webhook-tag-popout');
    }
};
