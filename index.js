const { Plugin } = require('powercord/entities');
const { getModule, getModuleByDisplayName, React } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');

const Tag = require('./Components/tag');

module.exports = class WebTag extends Plugin {
	async startPlugin() {
		this.loadStylesheet('./style.css');

		const MessageTimestamp = getModule([ 'MessageTimestamp' ], false) || getModule(m => (
			typeof (m?.__powercordOriginal_default || m.default) === 'function' &&
			(m?.__powercordOriginal_default || m.default).toString().includes('showTimestampOnHover')
		  ), false);
		const botTagRegularClasses = getModule(['botTagRegular'], false);
		const botTagClasses = getModule(['botTagCozy'], false);
		const remClasses = getModule(['rem'], false);

		inject('webhook-tag-messages', MessageTimestamp, 'default', (args, res) => {
			const msg = args[0].message;

			if (msg.webhookId !== null && msg.messageReference === null && msg.author.discriminator === '0000') {
				const header = findInReactTree(res.props.username, e => Array.isArray(e?.props?.children) && e.props.children.find(c => c?.props?.message));
				header.props.children[0].props.message.author.bot = false;
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
			if (user.discriminator !== '0000' || !user.bot) return res;

			elements[1].props.children[1].props.children = [
				elements[1].props.children[1].props.children,
				React.createElement(
					'span',
					{
						className: `webhook-tag-pop-out ${botTagClasses.botTagCozy} ${botTagClasses.botTagCompact} ` +
							`${botTagRegularClasses.botTagRegular} ${remClasses.rem}`
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
