use leptos::*;
use leptos::prelude::{ElementChild, ClassAttribute, StyleAttribute, OnAttribute, CustomAttribute, set_timeout, set_interval_with_handle, create_effect, create_signal, Get, Set, Update, IntoView, IntoAny, With};
use leptos::wasm_bindgen::JsCast;
use rand::Rng;
use std::time::Duration;
use web_sys::MouseEvent;

fn main() {
    console_error_panic_hook::set_once();
    leptos::mount::mount_to_body(|| view! { <App/> })
}

#[derive(Clone, Copy, Debug, PartialEq)]
enum ShapeType {
    Triangle,
    Circle,
    Square,
}

#[derive(Clone, Debug)]
struct Shape {
    id: usize,
    x: f64,
    y: f64,
    size: f64,
    rotation: f64,
    color: String,
    shape_type: ShapeType,
    dx: f64,
    dy: f64,
    rotation_speed: f64,
}

fn create_shape(id: usize, shape_type: ShapeType) -> Shape {
    let mut rng = rand::thread_rng();
    
    let x = 120.0;
    let y = rng.gen_range(-10.0..100.0);
    let speed = rng.gen_range(0.02..0.07);
    let dx = -speed;
    let dy = 0.0;
    
    // Truly random RGB colors
    let r = rng.gen_range(0..256);
    let g = rng.gen_range(0..256);
    let b = rng.gen_range(0..256);
    let color = format!("rgb({}, {}, {})", r, g, b);
    
    Shape {
        id,
        x,
        y,
        size: rng.gen_range(25.0..65.0),
        rotation: rng.gen_range(0.0..360.0),
        color,
        shape_type,
        dx,
        dy,
        rotation_speed: rng.gen_range(-0.5..0.5),
    }
}

#[component]
fn App() -> impl IntoView {
    let (shapes, set_shapes) = create_signal::<Vec<Shape>>(vec![]);
    let (background_visible, set_background_visible) = create_signal(false);
    let (text_visible, set_text_visible) = create_signal(false);
    let (hovered_project, set_hovered_project) = create_signal::<Option<String>>(None);
    let (expanded_project, set_expanded_project) = create_signal::<Option<String>>(None);
    
    // Initialize shapes
    create_effect(move |_| {
        let initial_shapes: Vec<Shape> = vec![
            create_shape(0, ShapeType::Triangle),
            {
                let mut s = create_shape(1, ShapeType::Circle);
                s.x = 60.0;
                s
            },
            {
                let mut s = create_shape(2, ShapeType::Square);
                s.x = 30.0;
                s
            },
            {
                let mut s = create_shape(3, ShapeType::Triangle);
                s.x = 90.0;
                s
            },
        ];
        set_shapes.set(initial_shapes);
        
        set_timeout(move || set_background_visible.set(true), Duration::from_millis(100));
        set_timeout(move || set_text_visible.set(true), Duration::from_millis(600));
    });
    
    // Animation loop
    create_effect(move |_| {
        let _ = set_interval_with_handle(
            move || {
                set_shapes.update(|shapes| {
                    for shape in shapes.iter_mut() {
                        shape.x += shape.dx;
                        shape.y += shape.dy;
                        shape.rotation = (shape.rotation + shape.rotation_speed) % 360.0;
                        
                        if shape.x < -50.0 {
                            *shape = create_shape(shape.id, shape.shape_type);
                        }
                    }
                    
                    let on_screen: Vec<_> = shapes.iter().filter(|s| s.x > -50.0 && s.x < 120.0).collect();
                    
                    if on_screen.len() < 3 {
                        let shape_types = [ShapeType::Triangle, ShapeType::Circle, ShapeType::Square];
                        let mut rng = rand::thread_rng();
                        let new_type = shape_types[rng.gen_range(0..3)];
                        shapes.push(create_shape(shapes.len(), new_type));
                    }
                });
            },
            Duration::from_millis(16),
        );
    });
    
    let projects = vec![
        ("soliloquy", "https://github.com/atechnology-company/soliloquy"),
        ("plates", "https://plates.atechnology.company/"),
        ("standpoint", "https://standpoint.atechnology.company/"),
        ("infrastruct", "https://github.com/atechnology-company/infrastruct"),
        ("vuno", "https://github.com/atechnology-company/vuno"),
    ];
    
    let project_descriptions = move |name: &str| -> &str {
        match name {
            "soliloquy" => "soliloquy is a new type of operating system based on the zircon kernel built from the ground up for web. what makes soliloquy different aside from being faster, with a smaller footprint, and using less resources is the web based desktop environment built with servo and v8.\n\nbuilt primarily with rust.",
            "plates" => "plates is a universal ai assistant, that links all your devices together. it is local first, utilising on device language models and tools to interact with your services. it works anytime, anywhere. own your data with a local server, syncing photos, clipboard and your accounts. pickup where you left off on any device.\n\nbuilt with swiftui + rust. tableware (web ui) and mcp built with go and svelte.",
            "standpoint" => "standpoint is an opinion based social media platform to create tierlists and polls to share standpoints. it is ai powered and web-focused allowing you to grab photos across the web, as well as collaborate in real time.\n\nbuilt with svelte and python.",
            "infrastruct" => "infrastruct is an online ai-powered jurisprudence platform. compare opinions on any topic from the worlds religions as well as the culmination of knowledge from the greatest philosophers in history in one place. mix and match your own ideas and create your own system with our online tool. save your stances.\n\nbuilt with next.js, and backend r2 built with vlang.",
            "vuno" => "vuno is the text editor to end all text editors. keyboard based, but not complicated like vim, edit at lightspeed. ai copilot to help you write, code and more, with live notion-style markdown editing.\n\nbuilt with tauri (svelte+rust).",
            _ => ""
        }
    };
    
    let animate_letters = move |ev: MouseEvent| {
        if let Some(target) = ev.target() {
            if let Ok(element) = target.dyn_into::<web_sys::HtmlElement>() {
                // Set CSS variables on document root for transforms (reduced range)
                if let Some(document) = web_sys::window().and_then(|w| w.document()) {
                    if let Some(doc_element) = document.document_element() {
                        if let Some(html_element) = doc_element.dyn_ref::<web_sys::HtmlElement>() {
                            let mut rng = rand::thread_rng();
                            for i in 1..=50 {
                                let rotate = rng.gen_range(-30..=30);  // Reduced from -100..100
                                let loc = rng.gen_range(-40..=40);      // Reduced from -100..100
                                let loctwo = rng.gen_range(-40..=40);   // Reduced from -100..100
                                let _ = html_element.style().set_property(&format!("--rotate{}", i), &format!("{}deg", rotate));
                                let _ = html_element.style().set_property(&format!("--loc{}", i), &format!("{}%", loc));
                                let _ = html_element.style().set_property(&format!("--loctwo{}", i), &format!("{}%", loctwo));
                            }
                        }
                    }
                }
                
                // Randomize pastel colors on letters
                if let Ok(letters) = element.query_selector_all(".letter") {
                    let mut rng = rand::thread_rng();
                    for _i in 0..letters.length() {
                        if let Some(letter) = letters.item(_i) {
                            if let Some(html_letter) = letter.dyn_ref::<web_sys::HtmlElement>() {
                                // Generate pastel colors (high lightness, medium saturation)
                                let hue = rng.gen_range(0..360);
                                let saturation = rng.gen_range(60..80);
                                let lightness = rng.gen_range(70..85);
                                let _ = html_letter.style().set_property("color", &format!("hsl({}, {}%, {}%)", hue, saturation, lightness));
                            }
                        }
                    }
                }
            }
        }
    };
    
    let reset_letters = move |ev: MouseEvent| {
        if let Some(target) = ev.target() {
            if let Ok(element) = target.dyn_into::<web_sys::HtmlElement>() {
                // Remove inline color styles from letters
                if let Ok(letters) = element.query_selector_all(".letter") {
                    for _i in 0..letters.length() {
                        if let Some(letter) = letters.item(_i) {
                            if let Some(html_letter) = letter.dyn_ref::<web_sys::HtmlElement>() {
                                let _ = html_letter.style().remove_property("color");
                            }
                        }
                    }
                }
            }
        }
    };
    
    let render_letter_text = |text: &str| {
        text.chars().enumerate().map(|(i, c)| {
            let display_char = if c == ' ' { '\u{00A0}' } else { c };
            view! { <span class="outer"><span class="inner"><span class="letter" style=format!("animation-delay: {}ms", i * 100)>{display_char}</span></span></span> }
        }).collect::<Vec<_>>()
    };
    
    let nav_links = vec![
        ("see more at my github", "https://github.com/undivisible", false),
        ("instagram", "https://instagram.com/undivisible.dev", false),
        ("read my philosophy", "https://undivisible.notion.site/eudaimonia-total-latitude-2b45f9801be4805ba030d510404673c6", false),
        ("gizzmoelectronics.com", "https://gizzmoelectronics.com", false),
        ("technology.company", "https://atechnology.company", true),
    ];
    
    view! {
        <div class="relative w-screen h-screen bg-black overflow-hidden text-white overflow-y-auto md:overflow-hidden">
            // Background
            <div class="absolute inset-0 transition-opacity duration-1000" style:opacity=move || if background_visible.get() { "1" } else { "0" }>
                // Dot matrix
                <div class="absolute inset-0 pointer-events-none opacity-10" style="background-image: radial-gradient(circle, #b21f1f 1px, transparent 1px); background-size: 10px 10px; md:background-size: 15px 15px;"></div>
                
                // SVG Shapes
                <svg class="absolute inset-0 w-full h-full opacity-30 md:opacity-50 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"
                    style="mask-image: radial-gradient(circle, rgba(255, 255, 255, 1) 1.5px, transparent 1.5px); mask-size: 10px 10px; -webkit-mask-image: radial-gradient(circle, rgba(255, 255, 255, 1) 1.5px, transparent 1.5px); -webkit-mask-size: 10px 10px;">
                    <defs>
                        {move || {
                            shapes.with(|shapes_vec| {
                                shapes_vec.iter().map(|shape| {
                                    let color = shape.color.clone();
                                    let id = shape.id;
                                    view! {
                                        <linearGradient id=format!("gradient-{}", id) x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stop-color=color.clone()/>
                                            <stop offset="100%" stop-color=color/>
                                        </linearGradient>
                                    }
                                }).collect::<Vec<_>>()
                            })
                        }}
                    </defs>
                    {move || {
                        shapes.with(|shapes_vec| {
                            shapes_vec.iter().map(|shape| {
                                let transform = format!(
                                    "transform: {}; transform-origin: center;",
                                    format!("translate({}%, {}%) rotate({}deg)", shape.x, shape.y, shape.rotation)
                                );
                                let gradient_url = format!("url(#gradient-{})", shape.id);
                                let size = shape.size;
                                let shape_type = shape.shape_type;
                                
                                match shape_type {
                                    ShapeType::Triangle => {
                                        let height = size * 1.732 / 2.0;
                                        let points = format!(
                                            "0,{} {},{} {},{}",
                                            -height/2.0,
                                            size/2.0, height/2.0,
                                            -size/2.0, height/2.0
                                        );
                                        view! {
                                            <g style=transform>
                                                <polygon
                                                    points=points
                                                    fill=gradient_url
                                                    style="mix-blend-mode: screen; filter: blur(0.5px);"
                                                />
                                            </g>
                                        }.into_any()
                                    },
                                    ShapeType::Circle => view! {
                                        <g style=transform>
                                            <circle
                                                r=size / 2.0
                                                fill=gradient_url
                                                style="mix-blend-mode: screen; filter: blur(0.5px);"
                                            />
                                        </g>
                                    }.into_any(),
                                    ShapeType::Square => view! {
                                        <g style=transform>
                                            <rect
                                                x=-size / 2.0
                                                y=-size / 2.0
                                                width=size
                                                height=size
                                                fill=gradient_url
                                                style="mix-blend-mode: screen; filter: blur(0.5px);"
                                            />
                                        </g>
                                    }.into_any(),
                                }
                            }).collect::<Vec<_>>()
                        })
                    }}
                </svg>
            </div>
            
            // Content
            <div class="relative z-10 w-full h-full min-h-screen md:min-h-0">
                // Top/Bottom Navigation
                <div class="absolute bottom-[20px] left-[20px] right-[20px] md:top-[50px] md:right-[100px] md:left-auto md:bottom-auto flex flex-col md:flex-row gap-[10px] md:gap-[15px] items-start md:items-center text-white text-base md:text-2xl transition-all duration-1000"
                    style:opacity=move || if text_visible.get() { "1" } else { "0" }
                    style:transform=move || if text_visible.get() { "translateY(0)" } else { "translateY(-20px)" }>
                    {nav_links.iter().map(|(text, href, has_prefix)| {
                        view! {
                            <a class="fancy-link transition-colors inline-block" href=*href on:mouseenter=animate_letters>
                                {if *has_prefix {
                                    Some(view! { <span class="outer"><span class="inner"><span class="letter prefix-letter" style="color: #ff5705;">"a"</span></span></span> })
                                } else {
                                    None
                                }}
                                {render_letter_text(text)}
                            </a>
                        }
                    }).collect::<Vec<_>>()}
                </div>
                
                // Main Content
                <div class="absolute left-[20px] right-[20px] top-[50px] pb-[200px] md:pb-0 md:left-[100px] md:top-1/2 md:-translate-y-1/2 md:right-auto transition-all duration-1000 delay-300"
                    style:opacity=move || if text_visible.get() { "1" } else { "0" }
                    style:transform=move || if text_visible.get() { "translate(0, 0)" } else { "translate(-30px, 0)" }>
                    <div class="text-white text-base md:text-2xl mb-6 md:mb-8">
                        <p class="mb-0 flex flex-wrap items-center gap-1 md:gap-2">
                            "Hi. I'm Max Carter 祁明思. 🇭🇰🇦🇺🇷🇺🇨🇳🇮🇩"
                            <img src="/static/chechen.png" alt="" class="w-[16px] h-[14px] md:w-[22px] md:h-[18px] inline-block mb-1 -ml-0.5 md:-ml-1.5"/>
                        </p>
                        <p class="mb-0">"I make things, think about life and speak languages."</p>
                        <p class="mb-4">"Here's some of my projects:"</p>
                    </div>
                    
                    <div class="flex flex-col md:flex-row gap-[10px] md:gap-[15px] items-start md:items-center text-white text-base md:text-2xl">
                        {projects.iter().enumerate().map(|(index, &(project, href))| {
                            let project_name = project.to_string();
                            let project_href = href.to_string();
                            let animate_project = {
                                let project_name = project_name.clone();
                                move |ev: MouseEvent| {
                                    set_hovered_project.set(Some(project_name.clone()));
                                    animate_letters(ev);
                                }
                            };
                            let handle_click = {
                                let project_name = project_name.clone();
                                move |ev: MouseEvent| {
                                    if web_sys::window().and_then(|w| w.inner_width().ok()).and_then(|w| w.as_f64()).unwrap_or(1024.0) < 768.0 {
                                        ev.prevent_default();
                                        if expanded_project.get() == Some(project_name.clone()) {
                                            reset_letters(ev.clone());
                                            set_expanded_project.set(None);
                                        } else {
                                            animate_letters(ev.clone());
                                            set_expanded_project.set(Some(project_name.clone()));
                                        }
                                    }
                                }
                            };
                            let project_name_for_check = project_name.clone();
                            let project_name_for_check2 = project_name.clone();
                            let project_name_for_check3 = project_name.clone();
                            let desc = project_descriptions(project);
                            
                            view! {
                                <div class="w-full md:w-auto">
                                    <a
                                        href=project_href.clone()
                                        class=move || if expanded_project.get() == Some(project_name_for_check3.clone()) { "fancy-link expanded transition-colors cursor-pointer relative inline-block" } else { "fancy-link transition-colors cursor-pointer relative inline-block" }
                                        on:mouseenter=animate_project
                                        on:mouseleave=move |_| set_hovered_project.set(None)
                                        on:click=handle_click
                                        style=format!("transition-delay: {}ms", index * 100 + 500)
                                    >
                                        {project.chars().enumerate().map(|(i, c)| {
                                            let display_char = if c == ' ' { '\u{00A0}' } else { c };
                                            view! { <span class="outer"><span class="inner"><span class="letter" style=format!("animation-delay: {}ms", i * 100)>{display_char}</span></span></span> }
                                        }).collect::<Vec<_>>()}
                                    </a>
                                    
                                    <div 
                                        class="md:hidden overflow-hidden transition-all duration-500 ease-in-out"
                                        style:max-height=move || if expanded_project.get() == Some(project_name_for_check.clone()) { "500px" } else { "0px" }
                                        style:opacity=move || if expanded_project.get() == Some(project_name_for_check2.clone()) { "1" } else { "0" }
                                    >
                                        <div class="mt-3 mb-2 text-xs leading-relaxed whitespace-pre-line">
                                            {desc}
                                        </div>
                                        <a
                                            href=project_href
                                            class="inline-block mt-2 px-4 py-2 bg-white text-black rounded text-sm font-bold transition-transform hover:scale-105"
                                        >
                                            "Visit Project →"
                                        </a>
                                    </div>
                                </div>
                            }
                        }).collect::<Vec<_>>()}
                    </div>
                </div>
                
                // Desktop hover description
                {move || hovered_project.get().map(|project: String| {
                    let desc = project_descriptions(&project);
                    view! {
                        <div class="hidden md:block absolute left-[100px] bg-black/0 text-white text-sm leading-relaxed whitespace-pre-line max-w-[800px] z-50 pointer-events-none"
                            style="top: calc(50% + 180px); animation: fadeIn 0.3s ease-out forwards;">
                            {desc}
                        </div>
                    }
                })}
            </div>
        </div>
        <style>
            r#"
            @keyframes fadeIn { 
                from { opacity: 0; transform: translateY(-10px); } 
                to { opacity: 1; transform: translateY(0); } 
            }
            
            @keyframes float {
                from, to {
                    transform: translateY(-0%);
                }
                50% {    
                    transform: translateY(-10%);
                }
            }

            @media (max-width: 768px) {
                body {
                    overflow-y: auto;
                    overflow-x: hidden;
                }
                
                .link:hover > .outer > .inner, .fancy-link:hover > .outer > .inner {
                    animation: none;
                }
            }
            
            :root {
                --rotate1: 0deg; --loc1: 0%; --loctwo1: 0%;
                --rotate2: 0deg; --loc2: 0%; --loctwo2: 0%;
                --rotate3: 0deg; --loc3: 0%; --loctwo3: 0%;
                --rotate4: 0deg; --loc4: 0%; --loctwo4: 0%;
                --rotate5: 0deg; --loc5: 0%; --loctwo5: 0%;
                --rotate6: 0deg; --loc6: 0%; --loctwo6: 0%;
                --rotate7: 0deg; --loc7: 0%; --loctwo7: 0%;
                --rotate8: 0deg; --loc8: 0%; --loctwo8: 0%;
                --rotate9: 0deg; --loc9: 0%; --loctwo9: 0%;
                --rotate10: 0deg; --loc10: 0%; --loctwo10: 0%;
                --rotate11: 0deg; --loc11: 0%; --loctwo11: 0%;
                --rotate12: 0deg; --loc12: 0%; --loctwo12: 0%;
                --rotate13: 0deg; --loc13: 0%; --loctwo13: 0%;
                --rotate14: 0deg; --loc14: 0%; --loctwo14: 0%;
                --rotate15: 0deg; --loc15: 0%; --loctwo15: 0%;
                --rotate16: 0deg; --loc16: 0%; --loctwo16: 0%;
                --rotate17: 0deg; --loc17: 0%; --loctwo17: 0%;
                --rotate18: 0deg; --loc18: 0%; --loctwo18: 0%;
                --rotate19: 0deg; --loc19: 0%; --loctwo19: 0%;
                --rotate20: 0deg; --loc20: 0%; --loctwo20: 0%;
                --rotate21: 0deg; --loc21: 0%; --loctwo21: 0%;
                --rotate22: 0deg; --loc22: 0%; --loctwo22: 0%;
                --rotate23: 0deg; --loc23: 0%; --loctwo23: 0%;
                --rotate24: 0deg; --loc24: 0%; --loctwo24: 0%;
                --rotate25: 0deg; --loc25: 0%; --loctwo25: 0%;
                --rotate26: 0deg; --loc26: 0%; --loctwo26: 0%;
                --rotate27: 0deg; --loc27: 0%; --loctwo27: 0%;
                --rotate28: 0deg; --loc28: 0%; --loctwo28: 0%;
                --rotate29: 0deg; --loc29: 0%; --loctwo29: 0%;
                --rotate30: 0deg; --loc30: 0%; --loctwo30: 0%;
                --rotate31: 0deg; --loc31: 0%; --loctwo31: 0%;
                --rotate32: 0deg; --loc32: 0%; --loctwo32: 0%;
                --rotate33: 0deg; --loc33: 0%; --loctwo33: 0%;
                --rotate34: 0deg; --loc34: 0%; --loctwo34: 0%;
                --rotate35: 0deg; --loc35: 0%; --loctwo35: 0%;
                --rotate36: 0deg; --loc36: 0%; --loctwo36: 0%;
                --rotate37: 0deg; --loc37: 0%; --loctwo37: 0%;
                --rotate38: 0deg; --loc38: 0%; --loctwo38: 0%;
                --rotate39: 0deg; --loc39: 0%; --loctwo39: 0%;
                --rotate40: 0deg; --loc40: 0%; --loctwo40: 0%;
                --rotate41: 0deg; --loc41: 0%; --loctwo41: 0%;
                --rotate42: 0deg; --loc42: 0%; --loctwo42: 0%;
                --rotate43: 0deg; --loc43: 0%; --loctwo43: 0%;
                --rotate44: 0deg; --loc44: 0%; --loctwo44: 0%;
                --rotate45: 0deg; --loc45: 0%; --loctwo45: 0%;
                --rotate46: 0deg; --loc46: 0%; --loctwo46: 0%;
                --rotate47: 0deg; --loc47: 0%; --loctwo47: 0%;
                --rotate48: 0deg; --loc48: 0%; --loctwo48: 0%;
                --rotate49: 0deg; --loc49: 0%; --loctwo49: 0%;
                --rotate50: 0deg; --loc50: 0%; --loctwo50: 0%;
            }
            
            .fancy-link {
                text-decoration: none !important;
                color: white !important;
            }
            
            .fancy-link .letter {
                transition: color 800ms ease;
            }
            
            .fancy-link:not(:hover):not(.expanded) .letter:not(.prefix-letter) {
                color: white !important;
            }
            
            .link span, .fancy-link span {
                display: inline-block;
            }
            
            .link > .outer, .fancy-link > .outer {
                transition: transform 350ms ease;
            }
            
            .link:hover > .outer, .fancy-link:hover > .outer {
                transition-duration: 800ms;
            }
            
            .link:hover > .outer > .inner, .fancy-link:hover > .outer > .inner, .fancy-link.expanded > .outer > .inner {
                animation: float 5s ease infinite;
            }
            
            .link:hover > .outer:nth-child(1), .fancy-link:hover > .outer:nth-child(1), .fancy-link.expanded > .outer:nth-child(1) { transform: translate(var(--loc1), var(--loctwo1)) rotate(var(--rotate1)) !important; }
            .link:hover > .outer:nth-child(2), .fancy-link:hover > .outer:nth-child(2), .fancy-link.expanded > .outer:nth-child(2) { transform: translate(var(--loc2), var(--loctwo2)) rotate(var(--rotate2)) !important; }
            .link:hover > .outer:nth-child(3), .fancy-link:hover > .outer:nth-child(3), .fancy-link.expanded > .outer:nth-child(3) { transform: translate(var(--loc3), var(--loctwo3)) rotate(var(--rotate3)) !important; }
            .link:hover > .outer:nth-child(4), .fancy-link:hover > .outer:nth-child(4), .fancy-link.expanded > .outer:nth-child(4) { transform: translate(var(--loc4), var(--loctwo4)) rotate(var(--rotate4)) !important; }
            .link:hover > .outer:nth-child(5), .fancy-link:hover > .outer:nth-child(5), .fancy-link.expanded > .outer:nth-child(5) { transform: translate(var(--loc5), var(--loctwo5)) rotate(var(--rotate5)) !important; }
            .link:hover > .outer:nth-child(6), .fancy-link:hover > .outer:nth-child(6), .fancy-link.expanded > .outer:nth-child(6) { transform: translate(var(--loc6), var(--loctwo6)) rotate(var(--rotate6)) !important; }
            .link:hover > .outer:nth-child(7), .fancy-link:hover > .outer:nth-child(7), .fancy-link.expanded > .outer:nth-child(7) { transform: translate(var(--loc7), var(--loctwo7)) rotate(var(--rotate7)) !important; }
            .link:hover > .outer:nth-child(8), .fancy-link:hover > .outer:nth-child(8), .fancy-link.expanded > .outer:nth-child(8) { transform: translate(var(--loc8), var(--loctwo8)) rotate(var(--rotate8)) !important; }
            .link:hover > .outer:nth-child(9), .fancy-link:hover > .outer:nth-child(9), .fancy-link.expanded > .outer:nth-child(9) { transform: translate(var(--loc9), var(--loctwo9)) rotate(var(--rotate9)) !important; }
            .link:hover > .outer:nth-child(10), .fancy-link:hover > .outer:nth-child(10), .fancy-link.expanded > .outer:nth-child(10) { transform: translate(var(--loc10), var(--loctwo10)) rotate(var(--rotate10)) !important; }
            .link:hover > .outer:nth-child(11), .fancy-link:hover > .outer:nth-child(11), .fancy-link.expanded > .outer:nth-child(11) { transform: translate(var(--loc11), var(--loctwo11)) rotate(var(--rotate11)) !important; }
            .link:hover > .outer:nth-child(12), .fancy-link:hover > .outer:nth-child(12), .fancy-link.expanded > .outer:nth-child(12) { transform: translate(var(--loc12), var(--loctwo12)) rotate(var(--rotate12)) !important; }
            .link:hover > .outer:nth-child(13), .fancy-link:hover > .outer:nth-child(13), .fancy-link.expanded > .outer:nth-child(13) { transform: translate(var(--loc13), var(--loctwo13)) rotate(var(--rotate13)) !important; }
            .link:hover > .outer:nth-child(14), .fancy-link:hover > .outer:nth-child(14), .fancy-link.expanded > .outer:nth-child(14) { transform: translate(var(--loc14), var(--loctwo14)) rotate(var(--rotate14)) !important; }
            .link:hover > .outer:nth-child(15), .fancy-link:hover > .outer:nth-child(15), .fancy-link.expanded > .outer:nth-child(15) { transform: translate(var(--loc15), var(--loctwo15)) rotate(var(--rotate15)) !important; }
            .link:hover > .outer:nth-child(16), .fancy-link:hover > .outer:nth-child(16), .fancy-link.expanded > .outer:nth-child(16) { transform: translate(var(--loc16), var(--loctwo16)) rotate(var(--rotate16)) !important; }
            .link:hover > .outer:nth-child(17), .fancy-link:hover > .outer:nth-child(17), .fancy-link.expanded > .outer:nth-child(17) { transform: translate(var(--loc17), var(--loctwo17)) rotate(var(--rotate17)) !important; }
            .link:hover > .outer:nth-child(18), .fancy-link:hover > .outer:nth-child(18), .fancy-link.expanded > .outer:nth-child(18) { transform: translate(var(--loc18), var(--loctwo18)) rotate(var(--rotate18)) !important; }
            .link:hover > .outer:nth-child(19), .fancy-link:hover > .outer:nth-child(19), .fancy-link.expanded > .outer:nth-child(19) { transform: translate(var(--loc19), var(--loctwo19)) rotate(var(--rotate19)) !important; }
            .link:hover > .outer:nth-child(20), .fancy-link:hover > .outer:nth-child(20), .fancy-link.expanded > .outer:nth-child(20) { transform: translate(var(--loc20), var(--loctwo20)) rotate(var(--rotate20)) !important; }
            .link:hover > .outer:nth-child(21), .fancy-link:hover > .outer:nth-child(21), .fancy-link.expanded > .outer:nth-child(21) { transform: translate(var(--loc21), var(--loctwo21)) rotate(var(--rotate21)) !important; }
            .link:hover > .outer:nth-child(22), .fancy-link:hover > .outer:nth-child(22), .fancy-link.expanded > .outer:nth-child(22) { transform: translate(var(--loc22), var(--loctwo22)) rotate(var(--rotate22)) !important; }
            .link:hover > .outer:nth-child(23), .fancy-link:hover > .outer:nth-child(23), .fancy-link.expanded > .outer:nth-child(23) { transform: translate(var(--loc23), var(--loctwo23)) rotate(var(--rotate23)) !important; }
            .link:hover > .outer:nth-child(24), .fancy-link:hover > .outer:nth-child(24), .fancy-link.expanded > .outer:nth-child(24) { transform: translate(var(--loc24), var(--loctwo24)) rotate(var(--rotate24)) !important; }
            .link:hover > .outer:nth-child(25), .fancy-link:hover > .outer:nth-child(25), .fancy-link.expanded > .outer:nth-child(25) { transform: translate(var(--loc25), var(--loctwo25)) rotate(var(--rotate25)) !important; }
            .link:hover > .outer:nth-child(26), .fancy-link:hover > .outer:nth-child(26), .fancy-link.expanded > .outer:nth-child(26) { transform: translate(var(--loc26), var(--loctwo26)) rotate(var(--rotate26)) !important; }
            .link:hover > .outer:nth-child(27), .fancy-link:hover > .outer:nth-child(27), .fancy-link.expanded > .outer:nth-child(27) { transform: translate(var(--loc27), var(--loctwo27)) rotate(var(--rotate27)) !important; }
            .link:hover > .outer:nth-child(28), .fancy-link:hover > .outer:nth-child(28), .fancy-link.expanded > .outer:nth-child(28) { transform: translate(var(--loc28), var(--loctwo28)) rotate(var(--rotate28)) !important; }
            .link:hover > .outer:nth-child(29), .fancy-link:hover > .outer:nth-child(29), .fancy-link.expanded > .outer:nth-child(29) { transform: translate(var(--loc29), var(--loctwo29)) rotate(var(--rotate29)) !important; }
            .link:hover > .outer:nth-child(30), .fancy-link:hover > .outer:nth-child(30), .fancy-link.expanded > .outer:nth-child(30) { transform: translate(var(--loc30), var(--loctwo30)) rotate(var(--rotate30)) !important; }
            .link:hover > .outer:nth-child(31), .fancy-link:hover > .outer:nth-child(31), .fancy-link.expanded > .outer:nth-child(31) { transform: translate(var(--loc31), var(--loctwo31)) rotate(var(--rotate31)) !important; }
            .link:hover > .outer:nth-child(32), .fancy-link:hover > .outer:nth-child(32), .fancy-link.expanded > .outer:nth-child(32) { transform: translate(var(--loc32), var(--loctwo32)) rotate(var(--rotate32)) !important; }
            .link:hover > .outer:nth-child(33), .fancy-link:hover > .outer:nth-child(33), .fancy-link.expanded > .outer:nth-child(33) { transform: translate(var(--loc33), var(--loctwo33)) rotate(var(--rotate33)) !important; }
            .link:hover > .outer:nth-child(34), .fancy-link:hover > .outer:nth-child(34), .fancy-link.expanded > .outer:nth-child(34) { transform: translate(var(--loc34), var(--loctwo34)) rotate(var(--rotate34)) !important; }
            .link:hover > .outer:nth-child(35), .fancy-link:hover > .outer:nth-child(35), .fancy-link.expanded > .outer:nth-child(35) { transform: translate(var(--loc35), var(--loctwo35)) rotate(var(--rotate35)) !important; }
            .link:hover > .outer:nth-child(36), .fancy-link:hover > .outer:nth-child(36), .fancy-link.expanded > .outer:nth-child(36) { transform: translate(var(--loc36), var(--loctwo36)) rotate(var(--rotate36)) !important; }
            .link:hover > .outer:nth-child(37), .fancy-link:hover > .outer:nth-child(37), .fancy-link.expanded > .outer:nth-child(37) { transform: translate(var(--loc37), var(--loctwo37)) rotate(var(--rotate37)) !important; }
            .link:hover > .outer:nth-child(38), .fancy-link:hover > .outer:nth-child(38), .fancy-link.expanded > .outer:nth-child(38) { transform: translate(var(--loc38), var(--loctwo38)) rotate(var(--rotate38)) !important; }
            .link:hover > .outer:nth-child(39), .fancy-link:hover > .outer:nth-child(39), .fancy-link.expanded > .outer:nth-child(39) { transform: translate(var(--loc39), var(--loctwo39)) rotate(var(--rotate39)) !important; }
            .link:hover > .outer:nth-child(40), .fancy-link:hover > .outer:nth-child(40), .fancy-link.expanded > .outer:nth-child(40) { transform: translate(var(--loc40), var(--loctwo40)) rotate(var(--rotate40)) !important; }
            .link:hover > .outer:nth-child(41), .fancy-link:hover > .outer:nth-child(41), .fancy-link.expanded > .outer:nth-child(41) { transform: translate(var(--loc41), var(--loctwo41)) rotate(var(--rotate41)) !important; }
            .link:hover > .outer:nth-child(42), .fancy-link:hover > .outer:nth-child(42), .fancy-link.expanded > .outer:nth-child(42) { transform: translate(var(--loc42), var(--loctwo42)) rotate(var(--rotate42)) !important; }
            .link:hover > .outer:nth-child(43), .fancy-link:hover > .outer:nth-child(43), .fancy-link.expanded > .outer:nth-child(43) { transform: translate(var(--loc43), var(--loctwo43)) rotate(var(--rotate43)) !important; }
            .link:hover > .outer:nth-child(44), .fancy-link:hover > .outer:nth-child(44), .fancy-link.expanded > .outer:nth-child(44) { transform: translate(var(--loc44), var(--loctwo44)) rotate(var(--rotate44)) !important; }
            .link:hover > .outer:nth-child(45), .fancy-link:hover > .outer:nth-child(45), .fancy-link.expanded > .outer:nth-child(45) { transform: translate(var(--loc45), var(--loctwo45)) rotate(var(--rotate45)) !important; }
            .link:hover > .outer:nth-child(46), .fancy-link:hover > .outer:nth-child(46), .fancy-link.expanded > .outer:nth-child(46) { transform: translate(var(--loc46), var(--loctwo46)) rotate(var(--rotate46)) !important; }
            .link:hover > .outer:nth-child(47), .fancy-link:hover > .outer:nth-child(47), .fancy-link.expanded > .outer:nth-child(47) { transform: translate(var(--loc47), var(--loctwo47)) rotate(var(--rotate47)) !important; }
            .link:hover > .outer:nth-child(48), .fancy-link:hover > .outer:nth-child(48), .fancy-link.expanded > .outer:nth-child(48) { transform: translate(var(--loc48), var(--loctwo48)) rotate(var(--rotate48)) !important; }
            .link:hover > .outer:nth-child(49), .fancy-link:hover > .outer:nth-child(49), .fancy-link.expanded > .outer:nth-child(49) { transform: translate(var(--loc49), var(--loctwo49)) rotate(var(--rotate49)) !important; }
            .link:hover > .outer:nth-child(50), .fancy-link:hover > .outer:nth-child(50), .fancy-link.expanded > .outer:nth-child(50) { transform: translate(var(--loc50), var(--loctwo50)) rotate(var(--rotate50)) !important; }
            "#
        </style>
    }
}
