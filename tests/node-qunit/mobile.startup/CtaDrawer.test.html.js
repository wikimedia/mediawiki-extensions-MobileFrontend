module.exports = {
	defaultURLs: `
		<div class=" drawer drawer-container__drawer position-fixed">
			<button type="button" class="cdx-button cdx-button--size-large cdx-button--weight-quiet cdx-button--icon-only cancel">
				<span class="mf-icon mf-icon-expand "> </span>
				<span>mobile-frontend-drawer-arrow-label</span>
			</button>
			<p> </p>
			<a type="button" class="cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--size-medium cdx-button--weight-primary cdx-button--action-progressive " href="logIn">
				<span>Log in</span>
			</a>
			<div class="cta-drawer__anchors">
				<a href="signUp" class="mw-mf-anchor mw-mf-anchor-progressive ">
					Sign up
				</a>
			</div>
		</div>
	`,
	overrideURLs: `
		<div class=" drawer drawer-container__drawer position-fixed">
			<button type="button" class="cdx-button cdx-button--size-large cdx-button--weight-quiet cdx-button--icon-only cancel">
				<span class="mf-icon mf-icon-expand "> </span>
				<span>mobile-frontend-drawer-arrow-label</span>
			</button>
			<p> </p>
			<a type="button" class="cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--size-medium cdx-button--weight-primary cdx-button--action-progressive " href="customLogIn">
				<span>custom log in</span>
			</a>
			<div class="cta-drawer__anchors">
				<a href="customSignUp" class="mw-mf-anchor mw-mf-anchor-progressive ">
					custom sign up
				</a>
			</div>
		</div>
	`
};
