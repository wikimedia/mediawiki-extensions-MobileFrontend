/* eslint-env es6 */
module.exports = {
	defaultURLs: `
		<div class=" drawer position-fixed view-border-box ">
			<div
				class=" mw-ui-icon mw-ui-icon-mf-expand mw-ui-icon-element cancel "
			> </div>
			<p> </p>
			<a href=" logIn " class=" mw-ui-button mw-ui-progressive ">
				Log in
			</a>
			<div class="cta-drawer__anchors">
				<a href=" signUp " class=" mw-ui-anchor mw-ui-progressive ">
					Sign up
				</a>
			</div>
		</div>
	`,
	overrideURLs: `
		<div class=" drawer position-fixed view-border-box ">
			<div
				class=" mw-ui-icon mw-ui-icon-mf-expand mw-ui-icon-element cancel "
			> </div>
			<p> </p>
			<a href=" customLogIn " class=" mw-ui-button mw-ui-progressive ">
				custom log in
			</a>
			<div class="cta-drawer__anchors">
				<a href=" customSignUp " class=" mw-ui-anchor mw-ui-progressive ">
					custom sign up
				</a>
			</div>
		</div>
	`
};
