import app.modules.module as module # TODO: change import when creating test from module project.


def test_default_response():
    assert module.default_response == "No response from module.py"


def test_run_returns_default_message():
    out = module.run()
    assert module.default_response in out
    assert out.startswith("\n")


def test_respond_appends_to_response():
    first = module.respond("first")
    assert "first" in first
    second = module.respond("second")
    assert "first" in second
    assert "second" in second


def test_respond_with_explicit_message():
    out = module.respond("hello")
    assert "\nhello" in out
