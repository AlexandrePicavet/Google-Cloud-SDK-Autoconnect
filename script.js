// ==UserScript==
// @name         Google Cloud SDK Autoconnect
// @description  Auto connect to your gcloud account when using 'gcloud auth login' command
// @version      1.1.0
// @author       Alexandre Picavet (https://github.com/AlexandrePicavet)
// @namespace    https://github.com/AlexandrePicavet/Google-Cloud-SDK-Autoconnect
// @supportURL   https://github.com/AlexandrePicavet/Google-Cloud-SDK-Autoconnect/issues
// @license      GPL-3.0
// @match        https://accounts.google.com/o/oauth2/auth*
// @match        https://accounts.google.com/signin/oauth/id*
// @match        https://accounts.google.com/signin/oauth/consent*
// @match        https://sdk.cloud.google.com/authcode.html*
// @grant        GM_setClipboard
// @grant        GM_notification
// @grant        window.close
// ==/UserScript==

(function() {
	"use strict";

	const application = "Google Cloud SDK";

	function getElement(query, multi, predicate = () => true) {
		const selectElement = () =>
			multi ? document.querySelectorAll(query) : document.querySelector(query);
		const existsAndMatches = (element) =>
			element && predicate(multi ? [...element] : element);

		return new Promise((resolve) => {
			const element = selectElement();

			if (existsAndMatches(element)) {
				resolve(element);
				return;
			}

			const observer = new MutationObserver(() => {
				const observedElement = selectElement();

				if (existsAndMatches(observedElement)) {
					observer.disconnect();
					resolve(observedElement);
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		});
	}

	console.log("Automatic google auth connection script started.");

	document.URL.startsWith("https://accounts.google.com/o/oauth2/auth") &&
		getElement("[data-third-party-email]", true, (elements) =>
			elements.find((element) => element?.textContent?.trim() === application),
		)
			.then(() => getElement("[data-identifier]"))
			.then((element) => setInterval(() => element.click(), 100));

	document.URL.startsWith("https://accounts.google.com/signin/oauth/id") &&
		getElement("#headingText", false, (element) =>
			element?.textContent?.trim().includes(application),
		)
			.then(() => getElement("button", true))
			.then((elements) => elements[1].click());

	document.URL.startsWith("https://accounts.google.com/signin/oauth/consent") &&
		getElement(
			"#developer_info_glif",
			false,
			(element) => element?.textContent?.trim() === application,
		)
			.then(() => getElement("#submit_approve_access"))
			.then((element) => element.click());

	document.URL.startsWith("https://sdk.cloud.google.com/authcode.html") &&
		getElement(
			"code.auth-code",
			false,
			(element) => element?.textContent?.trim()?.length > 0,
		)
			.then((element) => element?.textContent?.trim())
			.then((code) => GM_setClipboard(code, "text"))
			.then(
				() => GM_notification({
					tag: 'google-sdk-autoconnect',
					title: 'Google SDK Autoconnect',
					text: 'Google SDK auth-code copied to clipboard.'
				})
			)
			.then(window.close);
})();
