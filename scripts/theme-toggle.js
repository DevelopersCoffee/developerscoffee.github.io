(function () {
	var KEY = "dc-theme";
	var root = document.documentElement;

	function apply(theme) {
		root.setAttribute("data-theme", theme);
	}

	apply(localStorage.getItem(KEY) || "light");

	document.addEventListener("DOMContentLoaded", function () {
		var btn = document.getElementById("np-theme-toggle");
		if (!btn) {
			return;
		}
		btn.addEventListener("click", function () {
			var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
			apply(next);
			localStorage.setItem(KEY, next);
		});
	});
})();
