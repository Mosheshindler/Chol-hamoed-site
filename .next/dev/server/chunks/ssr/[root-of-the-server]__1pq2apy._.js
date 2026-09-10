module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/app/page.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Header.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Footer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/Footer.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SignupCTA$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/SignupCTA.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$VideoCard$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/VideoCard.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$HomeSearch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/HomeSearch.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$HeroCarousel$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/HeroCarousel.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CategoryStrip$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/CategoryStrip.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/data.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demoVideos$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/demoVideos.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const searches = [
    'Funny',
    'Inspirational',
    'Lessons',
    'Music Video',
    'Under 5 min',
    'Long form',
    'Behind the scenes',
    'Kids',
    'Motivational',
    'Family'
];
async function Home() {
    const videos = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getVideos"])();
    const featuredVideos = videos.filter((v)=>v.featured);
    const fillers = videos.filter((v)=>!v.featured).slice(0, Math.max(0, 5 - featuredVideos.length));
    const heroVideos = [
        ...featuredVideos,
        ...fillers
    ].slice(0, 5);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/page.js",
                lineNumber: 19,
                columnNumber: 12
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$HeroCarousel$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        videos: heroVideos
                    }, void 0, false, {
                        fileName: "[project]/app/page.js",
                        lineNumber: 20,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "wide homeBody",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$HomeSearch$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                popular: searches
                            }, void 0, false, {
                                fileName: "[project]/app/page.js",
                                lineNumber: 22,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sectionHead",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    children: "BROWSE BY CATEGORY"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.js",
                                    lineNumber: 23,
                                    columnNumber: 36
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/page.js",
                                lineNumber: 23,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$CategoryStrip$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                categories: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demoVideos$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["categories"]
                            }, void 0, false, {
                                fileName: "[project]/app/page.js",
                                lineNumber: 24,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sectionHead justHead",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        children: "JUST MINTED"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.js",
                                        lineNumber: 25,
                                        columnNumber: 45
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                        href: "/category/all-videos",
                                        children: "View all  →"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.js",
                                        lineNumber: 25,
                                        columnNumber: 65
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.js",
                                lineNumber: 25,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "cards homeCards",
                                children: videos.slice(0, 5).map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$VideoCard$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                        video: v
                                    }, v.slug, false, {
                                        fileName: "[project]/app/page.js",
                                        lineNumber: 26,
                                        columnNumber: 66
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/page.js",
                                lineNumber: 26,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$SignupCTA$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                                fileName: "[project]/app/page.js",
                                lineNumber: 27,
                                columnNumber: 7
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/page.js",
                        lineNumber: 21,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.js",
                lineNumber: 19,
                columnNumber: 21
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Footer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/page.js",
                lineNumber: 29,
                columnNumber: 11
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.js",
        lineNumber: 19,
        columnNumber: 10
    }, this);
}
}),
"[project]/app/page.js [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/app/page.js [app-rsc] (ecmascript)"));
}),
"[project]/components/CategoryStrip.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CategoryStrip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/site.js [app-rsc] (ecmascript)");
;
;
;
function CategoryStrip({ categories }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "categoryScroller",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "categoryGrid lockedCategoryGrid",
            children: categories.map((c)=>{
                let slug = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["categorySlug"])(c);
                if (c === 'Q&A') slug = 'q-and-a';
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    href: `/category/${slug}`,
                    className: "cat lockedCat",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "catIcon lockedCatIcon",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: `/assets/category-icons-svg/${slug}.svg`,
                                alt: ""
                            }, void 0, false, {
                                fileName: "[project]/components/CategoryStrip.js",
                                lineNumber: 4,
                                columnNumber: 282
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/CategoryStrip.js",
                            lineNumber: 4,
                            columnNumber: 243
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            children: c
                        }, void 0, false, {
                            fileName: "[project]/components/CategoryStrip.js",
                            lineNumber: 4,
                            columnNumber: 348
                        }, this)
                    ]
                }, c, true, {
                    fileName: "[project]/components/CategoryStrip.js",
                    lineNumber: 4,
                    columnNumber: 176
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/components/CategoryStrip.js",
            lineNumber: 4,
            columnNumber: 44
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/CategoryStrip.js",
        lineNumber: 4,
        columnNumber: 10
    }, this);
}
}),
"[project]/components/Footer.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/components/Header.js [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/Header.js from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/Header.js", "default");
}),
"[project]/components/Header.js [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/Header.js <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/Header.js <module evaluation>", "default");
}),
"[project]/components/Header.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/Header.js [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/Header.js [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$Header$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/components/HeroCarousel.js [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/HeroCarousel.js from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/HeroCarousel.js", "default");
}),
"[project]/components/HeroCarousel.js [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/HeroCarousel.js <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/HeroCarousel.js <module evaluation>", "default");
}),
"[project]/components/HeroCarousel.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$HeroCarousel$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/HeroCarousel.js [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$HeroCarousel$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/HeroCarousel.js [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$HeroCarousel$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/components/HomeSearch.js [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/HomeSearch.js from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/HomeSearch.js", "default");
}),
"[project]/components/HomeSearch.js [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/HomeSearch.js <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/HomeSearch.js <module evaluation>", "default");
}),
"[project]/components/HomeSearch.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$HomeSearch$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/HomeSearch.js [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$HomeSearch$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/HomeSearch.js [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$HomeSearch$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/components/SignupCTA.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SignupCTA
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/site.js [app-rsc] (ecmascript)");
;
;
function MailIcon() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 48 48",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "5.5",
                y: "10.5",
                width: "37",
                height: "27",
                rx: "2",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2.5"
            }, void 0, false, {
                fileName: "[project]/components/SignupCTA.js",
                lineNumber: 3,
                columnNumber: 72
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M7 13l17 13 17-13",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2.5",
                strokeLinecap: "round",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/components/SignupCTA.js",
                lineNumber: 3,
                columnNumber: 178
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/SignupCTA.js",
        lineNumber: 3,
        columnNumber: 28
    }, this);
}
function WhatsAppIcon() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 48 48",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M24 6.5c-9.54 0-17.28 7.38-17.28 16.48 0 3.2.97 6.19 2.65 8.72L6.5 41.5l10.25-2.7a17.86 17.86 0 0 0 7.25 1.53c9.54 0 17.28-7.38 17.28-16.48S33.54 6.5 24 6.5Z",
                fill: "none",
                stroke: "currentColor",
                strokeWidth: "2.4",
                strokeLinejoin: "round"
            }, void 0, false, {
                fileName: "[project]/components/SignupCTA.js",
                lineNumber: 4,
                columnNumber: 76
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M17.2 14.8c.52-.05 1.04-.06 1.37.56l1.98 4.02c.25.5.17.84-.12 1.22l-1.36 1.66c-.27.33-.23.67-.05 1.03 1.23 2.4 3.3 4.48 5.74 5.75.34.18.68.2.98-.06l1.67-1.4c.37-.31.73-.39 1.23-.14l4.02 1.99c.6.3.66.84.56 1.36-.19 1.1-.95 2.46-2.05 3.15-1.06.66-2.35 1.02-3.57.75-2.08-.46-5.3-1.66-8.58-4.8-3.12-2.99-4.49-6.01-5.02-8.1-.32-1.24-.04-2.57.62-3.67.65-1.08 1.56-2.07 2.58-2.32Z",
                fill: "currentColor"
            }, void 0, false, {
                fileName: "[project]/components/SignupCTA.js",
                lineNumber: 4,
                columnNumber: 320
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/SignupCTA.js",
        lineNumber: 4,
        columnNumber: 32
    }, this);
}
function SignupCTA() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "cta homeSignup",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ctaPane",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ctaIcon",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(MailIcon, {}, void 0, false, {
                            fileName: "[project]/components/SignupCTA.js",
                            lineNumber: 6,
                            columnNumber: 130
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/SignupCTA.js",
                        lineNumber: 6,
                        columnNumber: 105
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ctaCopy",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ctaTitle",
                                children: "Sign up for our newsletter"
                            }, void 0, false, {
                                fileName: "[project]/components/SignupCTA.js",
                                lineNumber: 6,
                                columnNumber: 172
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ctaSub",
                                children: "Get the latest videos, updates and behind the scenes content."
                            }, void 0, false, {
                                fileName: "[project]/components/SignupCTA.js",
                                lineNumber: 6,
                                columnNumber: 230
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/SignupCTA.js",
                        lineNumber: 6,
                        columnNumber: 147
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        className: "followBtn",
                        href: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_LINKS"].newsletter,
                        target: "_blank",
                        rel: "noreferrer",
                        children: "Sign Up  →"
                    }, void 0, false, {
                        fileName: "[project]/components/SignupCTA.js",
                        lineNumber: 6,
                        columnNumber: 327
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/SignupCTA.js",
                lineNumber: 6,
                columnNumber: 80
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ctaDivider"
            }, void 0, false, {
                fileName: "[project]/components/SignupCTA.js",
                lineNumber: 6,
                columnNumber: 439
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "ctaPane",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ctaIcon waIcon",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(WhatsAppIcon, {}, void 0, false, {
                            fileName: "[project]/components/SignupCTA.js",
                            lineNumber: 6,
                            columnNumber: 525
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/SignupCTA.js",
                        lineNumber: 6,
                        columnNumber: 493
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "ctaCopy",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ctaTitle",
                                children: "Follow us on WhatsApp"
                            }, void 0, false, {
                                fileName: "[project]/components/SignupCTA.js",
                                lineNumber: 6,
                                columnNumber: 571
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ctaSub",
                                children: "Be the first to know when new videos drop."
                            }, void 0, false, {
                                fileName: "[project]/components/SignupCTA.js",
                                lineNumber: 6,
                                columnNumber: 624
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/SignupCTA.js",
                        lineNumber: 6,
                        columnNumber: 546
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        className: "followBtn",
                        href: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$site$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["SITE_LINKS"].whatsapp,
                        target: "_blank",
                        rel: "noreferrer",
                        children: "Follow Now  →"
                    }, void 0, false, {
                        fileName: "[project]/components/SignupCTA.js",
                        lineNumber: 6,
                        columnNumber: 702
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/SignupCTA.js",
                lineNumber: 6,
                columnNumber: 468
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/SignupCTA.js",
        lineNumber: 6,
        columnNumber: 44
    }, this);
}
}),
"[project]/components/VideoCard.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>VideoCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
;
;
function VideoCard({ video }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        href: `/watch/${video.slug}`,
        className: "card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "thumb",
                style: {
                    backgroundImage: `url(${video.thumbnail})`
                },
                children: [
                    video.premium ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "premiumCardBadge",
                        children: "YIDLY PREMIUM"
                    }, void 0, false, {
                        fileName: "[project]/components/VideoCard.js",
                        lineNumber: 2,
                        columnNumber: 194
                    }, this) : null,
                    video.duration ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "duration",
                        children: video.duration
                    }, void 0, false, {
                        fileName: "[project]/components/VideoCard.js",
                        lineNumber: 2,
                        columnNumber: 273
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/components/VideoCard.js",
                lineNumber: 2,
                columnNumber: 104
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "cardTitle",
                children: video.title
            }, void 0, false, {
                fileName: "[project]/components/VideoCard.js",
                lineNumber: 2,
                columnNumber: 337
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "cardMeta",
                children: video.category
            }, void 0, false, {
                fileName: "[project]/components/VideoCard.js",
                lineNumber: 2,
                columnNumber: 383
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/VideoCard.js",
        lineNumber: 2,
        columnNumber: 51
    }, this);
}
}),
"[project]/lib/data.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDatabaseVideos",
    ()=>getDatabaseVideos,
    "getVideoBySlug",
    ()=>getVideoBySlug,
    "getVideos",
    ()=>getVideos
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demoVideos$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/demoVideos.js [app-rsc] (ecmascript)");
;
function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
function parseVideoId(url, platform) {
    try {
        const u = new URL(url);
        if (platform === 'vimeo') return u.pathname.split('/').filter(Boolean)[0] || '';
        if (u.hostname.includes('youtu.be')) return u.pathname.split('/').filter(Boolean)[0] || '';
        return u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop() || '';
    } catch  {
        return '';
    }
}
function mapRow(row) {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        client: row.client || 'Mint Media',
        category: row.category || row.categories?.[0] || 'Video',
        categories: Array.isArray(row.categories) && row.categories.length ? row.categories : row.category ? [
            row.category
        ] : [],
        duration: formatDuration(row.duration_seconds),
        durationSeconds: row.duration_seconds || 0,
        provider: row.platform,
        videoId: parseVideoId(row.video_url, row.platform),
        vimeoHash: row.vimeo_hash || '',
        thumbnail: row.thumbnail_url || '/assets/thumb-united.jpg',
        heroImage: row.hero_image_url || '',
        featured: Boolean(row.featured),
        premium: Boolean(row.premium),
        purchaseUrl: row.purchase_url || '',
        published: Boolean(row.published),
        sortOrder: row.sort_order || 0,
        fromDatabase: true
    };
}
async function getDatabaseVideos() {
    const url = ("TURBOPACK compile-time value", "https://qqytekjvhdrdxmogeeln.supabase.co");
    const key = ("TURBOPACK compile-time value", "sb_publishable_lIKOxXsaSa3O3ZlbsUD8hA_hupXZ2Nm");
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const res = await fetch(`${url}/rest/v1/videos?select=*&published=eq.true&order=sort_order.asc,created_at.desc`, {
            headers: {
                apikey: key,
                Authorization: `Bearer ${key}`
            },
            cache: 'no-store'
        });
        if (!res.ok) {
            console.error('Supabase videos request failed', res.status, await res.text());
            return [];
        }
        const rows = await res.json();
        return rows.map(mapRow);
    } catch (err) {
        console.error('Supabase videos request error', err);
        return [];
    }
}
async function getVideos({ includeDemo = true } = {}) {
    const db = await getDatabaseVideos();
    if (!includeDemo) return db;
    const slugs = new Set(db.map((v)=>v.slug));
    return [
        ...db,
        ...__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$demoVideos$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["demoVideos"].filter((v)=>!slugs.has(v.slug))
    ];
}
async function getVideoBySlug(slug) {
    const videos = await getVideos();
    return videos.find((v)=>v.slug === slug);
}
}),
"[project]/lib/demoVideos.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "categories",
    ()=>categories,
    "demoVideos",
    ()=>demoVideos
]);
const demoVideos = [
    {
        slug: 'small-moments',
        title: 'Small Moments',
        client: 'Mint Media',
        category: 'Inspirational',
        duration: '03:28',
        provider: 'youtube',
        videoId: 'aqz-KE-bpKQ',
        thumbnail: '/assets/thumb-small-moments.jpg'
    },
    {
        slug: 'legacy-of-giving',
        title: 'A Legacy of Giving',
        client: 'Mint Media',
        category: 'Fundraising Film',
        duration: '04:12',
        provider: 'vimeo',
        videoId: '76979871',
        thumbnail: '/assets/thumb-legacy.jpg'
    },
    {
        slug: 'building-futures',
        title: 'Building Futures',
        client: 'Mint Media',
        category: 'Schools & Yeshivos',
        duration: '04:15',
        provider: 'youtube',
        videoId: 'aqz-KE-bpKQ',
        thumbnail: '/assets/thumb-building.jpg'
    },
    {
        slug: 'life-of-impact',
        title: 'A Life of Impact',
        client: 'Mint Media',
        category: 'Documentary',
        duration: '05:27',
        provider: 'vimeo',
        videoId: '76979871',
        thumbnail: '/assets/thumb-life.jpg'
    },
    {
        slug: 'different-path',
        title: 'A Different Path',
        client: 'Mint Media',
        category: 'Jewish Life',
        duration: '06:14',
        provider: 'youtube',
        videoId: 'aqz-KE-bpKQ',
        thumbnail: '/assets/thumb-building.jpg'
    },
    {
        slug: 'brighter-tomorrow',
        title: 'A Brighter Tomorrow',
        client: 'Mint Media',
        category: 'Inspirational',
        duration: '02:46',
        provider: 'vimeo',
        videoId: '76979871',
        thumbnail: '/assets/thumb-legacy.jpg'
    },
    {
        slug: 'more-than-building',
        title: 'More Than a Building',
        client: 'Mint Media',
        category: 'Community',
        duration: '03:52',
        provider: 'youtube',
        videoId: 'aqz-KE-bpKQ',
        thumbnail: '/assets/thumb-small-moments.jpg'
    },
    {
        slug: 'next-generation',
        title: 'The Next Generation',
        client: 'Mint Media',
        category: 'Education',
        duration: '04:08',
        provider: 'vimeo',
        videoId: '76979871',
        thumbnail: '/assets/thumb-life.jpg'
    }
];
const categories = [
    'All Videos',
    'Stories',
    'Documentaries',
    'Entertainment',
    'Music Videos',
    'Q&A',
    'Behind the Scenes',
    'Events & Highlights',
    'Shorts',
    'Premium Content'
];
}),
"[project]/lib/site.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALL_CATEGORIES",
    ()=>ALL_CATEGORIES,
    "CATEGORIES",
    ()=>CATEGORIES,
    "SITE_LINKS",
    ()=>SITE_LINKS,
    "categorySlug",
    ()=>categorySlug
]);
const SITE_LINKS = {
    newsletter: 'https://mailchi.mp/bfbaca4e33f3/mint-media-newsletter-sign-up',
    website: 'https://mintmediallc.com/home/',
    youtube: 'https://www.youtube.com/channel/UC--cmMC2hDngoYXYnqpasEQ/feed?view_as=public',
    vimeo: 'https://vimeo.com/mintmediavideo',
    instagram: 'https://www.instagram.com/mint_media_llc/',
    whatsapp: 'https://us.list-manage.com/PNkKxpwYW4e?e=62f224f32e&c2id=dac1993af6d35d622563f4772a6c21d2&m=3hu36aQULLjmb2MWMkayqHpcckltW6xVoyCgZKpEHnJ690DgByYdDQDuE1S9',
    email: 'info@mintmediallc.com',
    phone: '732-813-4222'
};
const CATEGORIES = [
    'Stories',
    'Documentaries',
    'Entertainment',
    'Music Videos',
    'Q&A',
    'Behind the Scenes',
    'Events & Highlights',
    'Shorts',
    'Premium Content'
];
const ALL_CATEGORIES = [
    'All Videos',
    ...CATEGORIES
];
const categorySlug = (c)=>c === 'Q&A' ? 'q-and-a' : c.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1pq2apy._.js.map