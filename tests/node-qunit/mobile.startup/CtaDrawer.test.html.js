module.exports = {
	defaultURLs: `
		<div class=" drawer drawer-container__drawer position-fixed">
			<button type="button" class="cdx-button cdx-button--size-large cdx-button--weight-quiet cdx-button--icon-only cancel">
				<span class="mw-ui-icon mw-ui-icon-mf-expand "> </span>
				<span></span>
			</button>
			<p> </p>
			<a href=" logIn " class=" mw-ui-button mw-ui-progressive ">
				Log in
			</a>
			<div class="cta-drawer__anchors">
				<a href=" signUp " class=" mw-mf-anchor mw-mf-anchor-progressive ">
					Sign up
				</a>
			</div>
		</div>
	`,
	overrideURLs: `
		<div class=" drawer drawer-container__drawer position-fixed">
			<button type="button" class="cdx-button cdx-button--size-large cdx-button--weight-quiet cdx-button--icon-only cancel">
				<span class="mw-ui-icon mw-ui-icon-mf-expand "> </span>
				<span></span>
			</button>
			<p> </p>
			<a href=" customLogIn " class=" mw-ui-button mw-ui-progressive ">
				custom log in
			</a>
			<div class="cta-drawer__anchors">
				<a href=" customSignUp " class=" mw-mf-anchor mw-mf-anchor-progressive ">
					custom sign up
				</a>
			</div>
		</div>
	`
};
