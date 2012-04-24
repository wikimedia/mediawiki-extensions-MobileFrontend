module("MobileFrontend references.js", {
	setup: function() {
		$('<div id="mfe-test-references"><sup><a href="#ref-foo">[1]</a></sup></div><ol class="references"><li id="ref-foo"><a>test reference</a></li></ol>').appendTo('#qunit-fixture');
	}
});

test("Standard", function() {
	MobileFrontend.references.init( $("#mfe-test-references")[0] );
	$("#mfe-test-references sup a").trigger("click");
	strictEqual($("#mf-references div h3").text(), "[1]");
	strictEqual($("#mf-references div a").text(), "test reference");
});
