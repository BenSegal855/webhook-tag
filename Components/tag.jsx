const { React } = require('powercord/webpack');

class Tag extends React.PureComponent {
	render () {
		return <div className={this.props.className}>WEBHOOK</div>;
	}
}

Tag.cache = {};
module.exports = Tag;
