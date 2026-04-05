//! Expand `__GH_*__` / `__URL_*__` tokens in HTML emitted by `crepus web build`
//! (JSON strings are HTML-escaped, so we inject links after generation).

use std::env;
use std::fs;
use std::path::PathBuf;

fn main() {
    let path = env::args()
        .nth(1)
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("dist/index.html"));

    let mut html = fs::read_to_string(&path).unwrap_or_else(|e| {
        eprintln!("expand-site-links: read {}: {e}", path.display());
        std::process::exit(1);
    });

    for (token, href, label) in replacements() {
        let anchor =
            format!(r#"<a href="{href}" rel="noopener noreferrer" target="_blank">{label}</a>"#);
        if !html.contains(token) {
            eprintln!("expand-site-links: warning: token not found: {token}");
        }
        html = html.replace(token, &anchor);
    }

    fs::write(&path, &html).unwrap_or_else(|e| {
        eprintln!("expand-site-links: write {}: {e}", path.display());
        std::process::exit(1);
    });

    eprintln!("expand-site-links: wrote {}", path.display());
}

fn replacements() -> &'static [(&'static str, &'static str, &'static str)] {
    &[
        // Core
        (
            "__CREPUS__",
            "https://github.com/semitechnological/crepuscularity",
            "Crepuscularity",
        ),
        (
            "__CREPUS_DSL__",
            "https://github.com/semitechnological/crepuscularity/blob/web-v3/docs/dsl.md",
            ".crepus",
        ),
        (
            "__CREPUS_WEBEXT__",
            "https://github.com/semitechnological/crepuscularity/blob/web-v3/docs/webext.md",
            "crepuscularity-webext",
        ),
        (
            "__CREPUS_REACT__",
            "https://github.com/semitechnological/crepuscularity#output-targets",
            "React / JSX interop",
        ),
        (
            "__EQUILIBRIUM__",
            "https://github.com/semitechnological/equilibrium",
            "Equilibrium",
        ),
        ("__WAX__", "https://github.com/semitechnological/wax", "Wax"),
        (
            "__SEMI_TAP__",
            "https://github.com/semitechnological/homebrew-tap",
            "semitechnological/homebrew-tap",
        ),
        (
            "__UNDI_TAP__",
            "https://github.com/undivisible/homebrew-tap",
            "undivisible/homebrew-tap",
        ),
        // Atechnology company
        (
            "__ATECH__",
            "https://atechnology.company/",
            "Atechnology company",
        ),
        (
            "__GH_ATECH_ORG__",
            "https://github.com/atechnology-company",
            "github.com/atechnology-company",
        ),
        (
            "__GH_ATECH_SERVO__",
            "https://github.com/atechnology-company/servo",
            "Servo",
        ),
        (
            "__GH_ATECH_V8__",
            "https://github.com/atechnology-company/rusty_v8",
            "rusty_v8",
        ),
        // Miniapps (GitHub profile + product URLs where listed)
        (
            "__MINI_ANYWHERE__",
            "https://github.com/undivisible/anywhere",
            "anywhere",
        ),
        (
            "__MINI_POKE__",
            "https://github.com/undivisible/poke-around",
            "poke around",
        ),
        (
            "__MINI_UNTHINKMAIL__",
            "https://unthinkmail.undivisible.dev/",
            "unthinkmail",
        ),
        (
            "__MINI_BUBLIK__",
            "https://bublik.undivisible.dev/",
            "bublik",
        ),
        (
            "__MINI_ALPHABETS__",
            "https://alphabets.undivisible.dev/",
            "alphabets",
        ),
        (
            "__GH_PROFILE__",
            "https://github.com/undivisible/undivisible",
            "my GitHub profile",
        ),
        (
            "__GH_UNDIVISIBLE__",
            "https://github.com/undivisible",
            "github.com/undivisible",
        ),
        (
            "__GH_SEMITECH__",
            "https://github.com/semitechnological",
            "github.com/semitechnological",
        ),
    ]
}
