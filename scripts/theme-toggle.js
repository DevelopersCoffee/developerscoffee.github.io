(function () {
	var saved = localStorage.getItem("theme");
	var theme = saved || "light";
	document.documentElement.dataset.theme = theme;

	document.addEventListener("DOMContentLoaded", function () {
		var btn = document.getElementById("theme-toggle");
		if (!btn) {
			return;
		}
		btn.addEventListener("click", function () {
			var current = document.documentElement.dataset.theme || "light";
			var next = current === "light" ? "dark" : "light";
			document.documentElement.dataset.theme = next;
			localStorage.setItem("theme", next);
		});
	});
})();
