(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/apollo-client.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "graphqlRequest",
    ()=>graphqlRequest
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const GRAPHQL_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4000/";
async function graphqlRequest(query, variables = {}) {
    const token = ("TURBOPACK compile-time truthy", 1) ? localStorage.getItem("farmchain_token") : "TURBOPACK unreachable";
    const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...token && {
                Authorization: `Bearer ${token}`
            }
        },
        body: JSON.stringify({
            query,
            variables
        })
    });
    const result = await response.json();
    if (result.errors) {
        throw new Error(result.errors[0].message);
    }
    return result.data;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/graphql/auth.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BUSINESS_LOGIN_QUERY",
    ()=>BUSINESS_LOGIN_QUERY,
    "BUSINESS_SIGNUP_QUERY",
    ()=>BUSINESS_SIGNUP_QUERY,
    "LOGIN_QUERY",
    ()=>LOGIN_QUERY,
    "ME_QUERY",
    ()=>ME_QUERY,
    "RESET_PASSWORD_MUTATION",
    ()=>RESET_PASSWORD_MUTATION,
    "SEND_OTP_MUTATION",
    ()=>SEND_OTP_MUTATION,
    "SIGNUP_QUERY",
    ()=>SIGNUP_QUERY,
    "VERIFY_OTP_MUTATION",
    ()=>VERIFY_OTP_MUTATION
]);
const LOGIN_QUERY = `
  mutation Login($identifier: String!, $password: String!, $role: String) {
    login(identifier: $identifier, password: $password, role: $role) {
      token
      user {
        id
        name
        email
        phone
        role
      }
    }
  }
`;
const SIGNUP_QUERY = `
  mutation Signup($name: String!, $email: String, $phone: String, $password: String!, $role: String) {
    signup(name: $name, email: $email, phone: $phone, password: $password, role: $role) {
      token
      user {
        id
        name
        email
        phone
        role
      }
    }
  }
`;
const SEND_OTP_MUTATION = `
  mutation SendOTP($identifier: String!) {
    sendOTP(identifier: $identifier) {
      success
      message
      otp
    }
  }
`;
const VERIFY_OTP_MUTATION = `
  mutation VerifyOTP($identifier: String!, $otp: String!) {
    verifyOTP(identifier: $identifier, otp: $otp) {
      success
      message
    }
  }
`;
const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($identifier: String!, $otp: String!, $newPassword: String!) {
    resetPassword(identifier: $identifier, otp: $otp, newPassword: $newPassword) {
      success
      message
    }
  }
`;
const ME_QUERY = `
  query Me {
    me {
      id
      name
      email
      phone
      role
    }
  }
`;
const BUSINESS_LOGIN_QUERY = `
  mutation BusinessLogin($identifier: String!, $password: String!) {
    businessLogin(identifier: $identifier, password: $password) {
      token
      business {
        id
        companyName
        email
        phone
        businessType
      }
    }
  }
`;
const BUSINESS_SIGNUP_QUERY = `
  mutation BusinessSignup($companyName: String!, $email: String, $phone: String, $password: String!, $businessType: String!, $city: String!, $state: String!, $pinCode: String!, $gstNumber: String) {
    businessSignup(
      companyName: $companyName
      email: $email
      phone: $phone
      password: $password
      businessType: $businessType
      city: $city
      state: $state
      pinCode: $pinCode
      gstNumber: $gstNumber
    ) {
      token
      business {
        id
        companyName
        email
        phone
        businessType
        address {
          city
          state
          pinCode
        }
        isVerified
      }
    }
  }
`;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/AuthContext.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apollo$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/apollo-client.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$graphql$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/graphql/auth.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const initAuth = {
                "AuthProvider.useEffect.initAuth": async ()=>{
                    const token = localStorage.getItem("farmchain_token");
                    const storedUser = localStorage.getItem("farmchain_user");
                    if (token && storedUser) {
                        setUser(JSON.parse(storedUser));
                        try {
                            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apollo$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$graphql$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ME_QUERY"]);
                            if (data?.me) {
                                setUser(data.me);
                                localStorage.setItem("farmchain_user", JSON.stringify(data.me));
                            }
                        } catch (err) {
                            console.error("Auth refresh failed:", err);
                            localStorage.removeItem("farmchain_token");
                            localStorage.removeItem("farmchain_user");
                            setUser(null);
                        }
                    }
                    setLoading(false);
                }
            }["AuthProvider.useEffect.initAuth"];
            initAuth();
        }
    }["AuthProvider.useEffect"], []);
    const login = async (identifier, password, role)=>{
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apollo$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$graphql$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["LOGIN_QUERY"], {
                identifier,
                password,
                role
            });
            if (data?.login) {
                localStorage.setItem("farmchain_token", data.login.token);
                localStorage.setItem("farmchain_user", JSON.stringify(data.login.user));
                setUser(data.login.user);
                return {
                    success: true,
                    user: data.login.user
                };
            }
            return {
                success: false,
                error: "Login failed"
            };
        } catch (err) {
            return {
                success: false,
                error: err.message
            };
        }
    };
    const signup = async (name, email, phone, password, role)=>{
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apollo$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$graphql$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SIGNUP_QUERY"], {
                name,
                email,
                phone,
                password,
                role
            });
            if (data?.signup) {
                localStorage.setItem("farmchain_token", data.signup.token);
                localStorage.setItem("farmchain_user", JSON.stringify(data.signup.user));
                setUser(data.signup.user);
                return {
                    success: true,
                    user: data.signup.user
                };
            }
            return {
                success: false,
                error: "Signup failed"
            };
        } catch (err) {
            return {
                success: false,
                error: err.message
            };
        }
    };
    const businessLogin = async (identifier, password)=>{
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apollo$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$graphql$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUSINESS_LOGIN_QUERY"], {
                identifier,
                password
            });
            if (data?.businessLogin) {
                localStorage.setItem("farmchain_token", data.businessLogin.token);
                localStorage.setItem("farmchain_user", JSON.stringify({
                    ...data.businessLogin.business,
                    role: "business"
                }));
                setUser({
                    ...data.businessLogin.business,
                    role: "business"
                });
                return {
                    success: true,
                    user: data.businessLogin.business
                };
            }
            return {
                success: false,
                error: "Login failed"
            };
        } catch (err) {
            return {
                success: false,
                error: err.message
            };
        }
    };
    const businessSignup = async (businessData)=>{
        try {
            const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$apollo$2d$client$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["graphqlRequest"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$graphql$2f$auth$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BUSINESS_SIGNUP_QUERY"], businessData);
            if (data?.businessSignup) {
                localStorage.setItem("farmchain_token", data.businessSignup.token);
                localStorage.setItem("farmchain_user", JSON.stringify({
                    ...data.businessSignup.business,
                    role: "business"
                }));
                setUser({
                    ...data.businessSignup.business,
                    role: "business"
                });
                return {
                    success: true,
                    user: data.businessSignup.business
                };
            }
            return {
                success: false,
                error: "Signup failed"
            };
        } catch (err) {
            return {
                success: false,
                error: err.message
            };
        }
    };
    const logout = ()=>{
        localStorage.removeItem("farmchain_token");
        localStorage.removeItem("farmchain_user");
        setUser(null);
        router.push("/");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            isAuthenticated: !!user,
            isFarmer: user?.role === "farmer",
            isConsumer: user?.role === "consumer",
            isBusiness: user?.role === "business",
            login,
            signup,
            businessLogin,
            businessSignup,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/AuthContext.js",
        lineNumber: 132,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "J17Kp8z+0ojgAqGoY5o3BCjwWms=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = AuthProvider;
const useAuth = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/Toast.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastProvider",
    ()=>ToastProvider,
    "default",
    ()=>__TURBOPACK__default__export__,
    "useToast",
    ()=>useToast
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
// Toast Context
const ToastContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
// Toast types with their styles
const toastTypes = {
    success: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"],
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        iconColor: "text-emerald-500",
        textColor: "text-emerald-800",
        progressColor: "bg-emerald-500"
    },
    error: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"],
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        iconColor: "text-red-500",
        textColor: "text-red-800",
        progressColor: "bg-red-500"
    },
    warning: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        iconColor: "text-amber-500",
        textColor: "text-amber-800",
        progressColor: "bg-amber-500"
    },
    info: {
        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"],
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        iconColor: "text-blue-500",
        textColor: "text-blue-800",
        progressColor: "bg-blue-500"
    }
};
// Individual Toast Component
function ToastItem({ id, message, type = "success", duration = 3000, onClose }) {
    _s();
    const [progress, setProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(100);
    const config = toastTypes[type] || toastTypes.success;
    const Icon = config.icon;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ToastItem.useEffect": ()=>{
            const startTime = Date.now();
            const interval = setInterval({
                "ToastItem.useEffect.interval": ()=>{
                    const elapsed = Date.now() - startTime;
                    const remaining = Math.max(0, 100 - elapsed / duration * 100);
                    setProgress(remaining);
                    if (remaining <= 0) {
                        clearInterval(interval);
                        onClose(id);
                    }
                }
            }["ToastItem.useEffect.interval"], 10);
            return ({
                "ToastItem.useEffect": ()=>clearInterval(interval)
            })["ToastItem.useEffect"];
        }
    }["ToastItem.useEffect"], [
        duration,
        id,
        onClose
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            y: -20,
            scale: 0.95
        },
        animate: {
            opacity: 1,
            y: 0,
            scale: 1
        },
        exit: {
            opacity: 0,
            y: -20,
            scale: 0.95
        },
        transition: {
            duration: 0.2,
            ease: "easeOut"
        },
        className: `relative overflow-hidden rounded-xl border ${config.bgColor} ${config.borderColor} shadow-lg min-w-[300px] max-w-[400px]`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex-shrink-0 ${config.iconColor}`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                            className: "w-5 h-5"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/Toast.js",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Toast.js",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `flex-1 text-sm font-medium ${config.textColor}`,
                        children: message
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Toast.js",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onClose(id),
                        className: `flex-shrink-0 ${config.textColor} hover:opacity-70 transition-opacity`,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/Toast.js",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/Toast.js",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/Toast.js",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "h-1 bg-black/5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    className: `h-full ${config.progressColor}`,
                    initial: {
                        width: "100%"
                    },
                    animate: {
                        width: `${progress}%`
                    },
                    transition: {
                        duration: 0.01
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/Toast.js",
                    lineNumber: 92,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Toast.js",
                lineNumber: 91,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Toast.js",
        lineNumber: 69,
        columnNumber: 5
    }, this);
}
_s(ToastItem, "/7XgPcdmDrfoeiaNFvL1LEUveYc=");
_c = ToastItem;
// Toast Container Component
function ToastContainer({ toasts, removeToast }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-4 right-4 z-[9999] flex flex-col gap-2",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
            mode: "popLayout",
            children: toasts.map((toast)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastItem, {
                    ...toast,
                    onClose: removeToast
                }, toast.id, false, {
                    fileName: "[project]/src/components/ui/Toast.js",
                    lineNumber: 109,
                    columnNumber: 11
                }, this))
        }, void 0, false, {
            fileName: "[project]/src/components/ui/Toast.js",
            lineNumber: 107,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Toast.js",
        lineNumber: 106,
        columnNumber: 5
    }, this);
}
_c1 = ToastContainer;
function ToastProvider({ children }) {
    _s1();
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const addToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[addToast]": (message, type = "success", duration = 3000)=>{
            const id = Date.now() + Math.random();
            setToasts({
                "ToastProvider.useCallback[addToast]": (prev)=>[
                        ...prev,
                        {
                            id,
                            message,
                            type,
                            duration
                        }
                    ]
            }["ToastProvider.useCallback[addToast]"]);
            return id;
        }
    }["ToastProvider.useCallback[addToast]"], []);
    const removeToast = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ToastProvider.useCallback[removeToast]": (id)=>{
            setToasts({
                "ToastProvider.useCallback[removeToast]": (prev)=>prev.filter({
                        "ToastProvider.useCallback[removeToast]": (toast)=>toast.id !== id
                    }["ToastProvider.useCallback[removeToast]"])
            }["ToastProvider.useCallback[removeToast]"]);
        }
    }["ToastProvider.useCallback[removeToast]"], []);
    const toast = {
        success: (message, duration)=>addToast(message, "success", duration),
        error: (message, duration)=>addToast(message, "error", duration),
        warning: (message, duration)=>addToast(message, "warning", duration),
        info: (message, duration)=>addToast(message, "info", duration)
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContext.Provider, {
        value: toast,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastContainer, {
                toasts: toasts,
                removeToast: removeToast
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Toast.js",
                lineNumber: 144,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/Toast.js",
        lineNumber: 142,
        columnNumber: 5
    }, this);
}
_s1(ToastProvider, "tmfEFb4ovUrwhRRzkxJL7vA7ka4=");
_c2 = ToastProvider;
function useToast() {
    _s2();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
_s2(useToast, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
const __TURBOPACK__default__export__ = ToastProvider;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "ToastItem");
__turbopack_context__.k.register(_c1, "ToastContainer");
__turbopack_context__.k.register(_c2, "ToastProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/locales/en/common.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"language":"Language","select_language":"Select language","dashboard":"Dashboard","farm_management":"Farm Management","batch_tracking":"Batch Tracking","products":"Products","wallet":"Wallet","business_hub":"Business Hub","earnings":"Earnings","profile":"Profile","sign_out":"Sign Out","farmer_portal":"Farmer Portal","notifications":"Notifications","my_farms":"My Farms","manage_farm_locations":"Manage all your farm locations","add_farm":"Add Farm","add_first_farm":"Add Your First Farm","no_farms_yet":"No Farms Yet","location_gps":"Location (GPS Coordinates)","latitude":"Latitude","longitude":"Longitude","use_current_location":"Use Current Location","farm_size":"Farm Size (Acres)","pin_code":"PIN Code","soil_type":"Soil Type","organic_status":"Organic Status","farm_photo":"Farm Photo","update_farm":"Update Farm","add_new_farm":"Add New Farm","edit_farm":"Edit Farm","view_farm":"View Farm","coordinates":"Coordinates","blockchain_wallet":"Blockchain Wallet","connect_wallet_help":"Connect MetaMask and make sure you are on Sepolia.","metamask":"MetaMask","installed":"Installed","not_detected":"Not detected","wallet_address":"Wallet Address","network":"Network","not_connected":"Not connected","connect_wallet":"Connect Wallet","reconnect_wallet":"Reconnect Wallet","switch_to_sepolia":"Switch To Sepolia","refresh":"Refresh","disconnect_session":"Disconnect Session","view_on_explorer":"View On Explorer","please_wait":"Please wait...","verification_failed":"Verification Failed","invalid_qr":"Invalid QR Code","farmchain_verified":"FarmChain Verified","farm_name":"Farm Name","location":"Location","sowing_date":"Sowing Date","blockchain_status":"Blockchain Status","verified_onchain":"Verified on-chain","not_verified":"Not verified","view_on_etherscan":"View on Etherscan","farm_to_table":"Farm to Table Journey","on_chain":"On-Chain","organic":"Organic","proof":"Proof","secured_by_blockchain":"Secured by Ethereum Sepolia Blockchain","verifying_records":"Verifying Blockchain Records...","create_batch":"Create Batch","recent_batches":"Recent Batches","track_latest_production":"Track your latest production","view_all":"View All","total_batches":"Total Batches","active_products":"Active Products","total_sold":"Total Sold","estimated_revenue":"Est. Revenue","good_morning":"Good Morning","good_afternoon":"Good Afternoon","good_evening":"Good Evening"});}),
"[project]/locales/bn/common.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"language":"Language","select_language":"Select language","dashboard":"Dashboard","farm_management":"Farm Management","batch_tracking":"Batch Tracking","products":"Products","wallet":"Wallet","business_hub":"Business Hub","earnings":"Earnings","profile":"Profile","sign_out":"Sign Out","farmer_portal":"Farmer Portal","notifications":"Notifications","my_farms":"My Farms","manage_farm_locations":"Manage all your farm locations","add_farm":"Add Farm","add_first_farm":"Add Your First Farm","no_farms_yet":"No Farms Yet","location_gps":"Location (GPS Coordinates)","latitude":"Latitude","longitude":"Longitude","use_current_location":"Use Current Location","farm_size":"Farm Size (Acres)","pin_code":"PIN Code","soil_type":"Soil Type","organic_status":"Organic Status","farm_photo":"Farm Photo","update_farm":"Update Farm","add_new_farm":"Add New Farm","edit_farm":"Edit Farm","view_farm":"View Farm","coordinates":"Coordinates","blockchain_wallet":"Blockchain Wallet","connect_wallet_help":"Connect MetaMask and make sure you are on Sepolia.","metamask":"MetaMask","installed":"Installed","not_detected":"Not detected","wallet_address":"Wallet Address","network":"Network","not_connected":"Not connected","connect_wallet":"Connect Wallet","reconnect_wallet":"Reconnect Wallet","switch_to_sepolia":"Switch To Sepolia","refresh":"Refresh","disconnect_session":"Disconnect Session","view_on_explorer":"View On Explorer","please_wait":"Please wait...","verification_failed":"Verification Failed","invalid_qr":"Invalid QR Code","farmchain_verified":"FarmChain Verified","farm_name":"Farm Name","location":"Location","sowing_date":"Sowing Date","blockchain_status":"Blockchain Status","verified_onchain":"Verified on-chain","not_verified":"Not verified","view_on_etherscan":"View on Etherscan","farm_to_table":"Farm to Table Journey","on_chain":"On-Chain","organic":"Organic","proof":"Proof","secured_by_blockchain":"Secured by Ethereum Sepolia Blockchain","verifying_records":"Verifying Blockchain Records...","create_batch":"Create Batch","recent_batches":"Recent Batches","track_latest_production":"Track your latest production","view_all":"View All","total_batches":"Total Batches","active_products":"Active Products","total_sold":"Total Sold","estimated_revenue":"Est. Revenue","good_morning":"Good Morning","good_afternoon":"Good Afternoon","good_evening":"Good Evening"});}),
"[project]/locales/hi/common.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"language":"भाषा","select_language":"भाषा चुनें","dashboard":"डैशबोर्ड","farm_management":"फार्म प्रबंधन","batch_tracking":"बैच ट्रैकिंग","products":"उत्पाद","wallet":"वॉलेट","business_hub":"बिजनेस हब","earnings":"कमाई","profile":"प्रोफाइल","sign_out":"साइन आउट","farmer_portal":"किसान पोर्टल","notifications":"सूचनाएं","my_farms":"मेरे फार्म","manage_farm_locations":"अपने सभी फार्म स्थान प्रबंधित करें","add_farm":"फार्म जोड़ें","add_first_farm":"अपना पहला फार्म जोड़ें","no_farms_yet":"अभी कोई फार्म नहीं","location_gps":"स्थान (GPS निर्देशांक)","latitude":"अक्षांश","longitude":"देशांतर","use_current_location":"वर्तमान स्थान उपयोग करें","farm_size":"फार्म का आकार (एकड़)","pin_code":"पिन कोड","soil_type":"मिट्टी का प्रकार","organic_status":"जैविक स्थिति","farm_photo":"फार्म फोटो","update_farm":"फार्म अपडेट करें","add_new_farm":"नया फार्म जोड़ें","edit_farm":"फार्म संपादित करें","view_farm":"फार्म देखें","coordinates":"निर्देशांक","blockchain_wallet":"ब्लॉकचेन वॉलेट","connect_wallet_help":"MetaMask कनेक्ट करें और सुनिश्चित करें कि आप Sepolia पर हैं।","metamask":"मेटामास्क","installed":"इंस्टॉल है","not_detected":"नहीं मिला","wallet_address":"वॉलेट पता","network":"नेटवर्क","not_connected":"कनेक्ट नहीं है","connect_wallet":"वॉलेट कनेक्ट करें","reconnect_wallet":"वॉलेट पुनः कनेक्ट करें","switch_to_sepolia":"Sepolia पर स्विच करें","refresh":"रीफ्रेश","disconnect_session":"सेशन डिस्कनेक्ट करें","view_on_explorer":"एक्सप्लोरर में देखें","please_wait":"कृपया प्रतीक्षा करें...","verification_failed":"सत्यापन विफल","invalid_qr":"अमान्य QR कोड","farmchain_verified":"FarmChain सत्यापित","farm_name":"फार्म का नाम","location":"स्थान","sowing_date":"बुवाई तिथि","blockchain_status":"ब्लॉकचेन स्थिति","verified_onchain":"ऑन-चेन सत्यापित","not_verified":"सत्यापित नहीं","view_on_etherscan":"Etherscan पर देखें","farm_to_table":"फार्म से थाली तक यात्रा","on_chain":"ऑन-चेन","organic":"जैविक","proof":"प्रमाण","secured_by_blockchain":"Ethereum Sepolia ब्लॉकचेन द्वारा सुरक्षित","verifying_records":"ब्लॉकचेन रिकॉर्ड सत्यापित हो रहे हैं...","create_batch":"बैच बनाएं","recent_batches":"हाल के बैच","track_latest_production":"अपने नवीनतम उत्पादन को ट्रैक करें","view_all":"सब देखें","total_batches":"कुल बैच","active_products":"सक्रिय उत्पाद","total_sold":"कुल बिक्री","estimated_revenue":"अनुमानित राजस्व","good_morning":"सुप्रभात","good_afternoon":"नमस्कार","good_evening":"शुभ संध्या"});}),
"[project]/locales/kn/common.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"language":"ಭಾಷೆ","select_language":"ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ","dashboard":"ಡ್ಯಾಶ್‌ಬೋರ್ಡ್","farm_management":"ಫಾರ್ಮ್ ನಿರ್ವಹಣೆ","batch_tracking":"ಬ್ಯಾಚ್ ಟ್ರ್ಯಾಕಿಂಗ್","products":"ಉತ್ಪನ್ನಗಳು","wallet":"ವಾಲೆಟ್","business_hub":"ಬಿಸಿನೆಸ್ ಹಬ್","earnings":"ಆದಾಯ","profile":"ಪ್ರೊಫೈಲ್","sign_out":"ಸೈನ್ ಔಟ್","farmer_portal":"ರೈತ ಪೋರ್ಟಲ್","notifications":"ಅಧಿಸೂಚನೆಗಳು","my_farms":"ನನ್ನ ಫಾರ್ಮ್‌ಗಳು","manage_farm_locations":"ನಿಮ್ಮ ಎಲ್ಲಾ ಫಾರ್ಮ್ ಸ್ಥಳಗಳನ್ನು ನಿರ್ವಹಿಸಿ","add_farm":"ಫಾರ್ಮ್ ಸೇರಿಸಿ","add_first_farm":"ನಿಮ್ಮ ಮೊದಲ ಫಾರ್ಮ್ ಸೇರಿಸಿ","no_farms_yet":"ಇನ್ನೂ ಫಾರ್ಮ್‌ಗಳಿಲ್ಲ","location_gps":"ಸ್ಥಳ (GPS ಸಂಯೋಜನೆಗಳು)","latitude":"ಅಕ್ಷಾಂಶ","longitude":"ರೇಖಾಂಶ","use_current_location":"ಪ್ರಸ್ತುತ ಸ್ಥಳ ಬಳಸಿ","farm_size":"ಫಾರ್ಮ್ ಗಾತ್ರ (ಏಕರ್)","pin_code":"ಪಿನ್ ಕೋಡ್","soil_type":"ಮಣ್ಣಿನ ಪ್ರಕಾರ","organic_status":"ಸಾವಯವ ಸ್ಥಿತಿ","farm_photo":"ಫಾರ್ಮ್ ಫೋಟೋ","update_farm":"ಫಾರ್ಮ್ ಅಪ್‌ಡೇಟ್ ಮಾಡಿ","add_new_farm":"ಹೊಸ ಫಾರ್ಮ್ ಸೇರಿಸಿ","edit_farm":"ಫಾರ್ಮ್ ಸಂಪಾದಿಸಿ","view_farm":"ಫಾರ್ಮ್ ವೀಕ್ಷಿಸಿ","coordinates":"ಸಂಯೋಜನೆಗಳು","blockchain_wallet":"ಬ್ಲಾಕ್‌ಚೈನ್ ವಾಲೆಟ್","connect_wallet_help":"MetaMask ಸಂಪರ್ಕಿಸಿ ಮತ್ತು ನೀವು Sepoliaನಲ್ಲಿ ಇದ್ದೀರಿ ಎಂದು ಖಚಿತಪಡಿಸಿ.","metamask":"ಮೆಟಾಮಾಸ್ಕ್","installed":"ಸ್ಥಾಪಿಸಲಾಗಿದೆ","not_detected":"ಪತ್ತೆಯಾಗಿಲ್ಲ","wallet_address":"ವಾಲೆಟ್ ವಿಳಾಸ","network":"ನೆಟ್ವರ್ಕ್","not_connected":"ಸಂಪರ್ಕ ಇಲ್ಲ","connect_wallet":"ವಾಲೆಟ್ ಸಂಪರ್ಕಿಸಿ","reconnect_wallet":"ವಾಲೆಟ್ ಮರುಸಂಪರ್ಕಿಸಿ","switch_to_sepolia":"Sepoliaಗೆ ಬದಲಿಸಿ","refresh":"ರಿಫ್ರೆಶ್","disconnect_session":"ಸೆಷನ್ ಡಿಸ್ಕನೆಕ್ಟ್","view_on_explorer":"ಎಕ್ಸ್‌ಪ್ಲೋರರ್‌ನಲ್ಲಿ ನೋಡಿ","please_wait":"ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ...","verification_failed":"ಪರಿಶೀಲನೆ ವಿಫಲ","invalid_qr":"ಅಮಾನ್ಯ QR ಕೋಡ್","farmchain_verified":"FarmChain ಪರಿಶೀಲಿಸಲಾಗಿದೆ","farm_name":"ಫಾರ್ಮ್ ಹೆಸರು","location":"ಸ್ಥಳ","sowing_date":"ಬಿತ್ತನೆ ದಿನಾಂಕ","blockchain_status":"ಬ್ಲಾಕ್‌ಚೈನ್ ಸ್ಥಿತಿ","verified_onchain":"ಆನ್-ಚೈನ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆ","not_verified":"ಪರಿಶೀಲನೆಗೊಂಡಿಲ್ಲ","view_on_etherscan":"Etherscan ನಲ್ಲಿ ನೋಡಿ","farm_to_table":"ಫಾರ್ಮ್‌ನಿಂದ ತಟ್ಟೆಯವರೆಗೆ ಪ್ರಯಾಣ","on_chain":"ಆನ್-ಚೈನ್","organic":"ಸಾವಯವ","proof":"ಪುರಾವೆ","secured_by_blockchain":"Ethereum Sepolia ಬ್ಲಾಕ್‌ಚೈನ್ ಮೂಲಕ ಸುರಕ್ಷಿತ","verifying_records":"ಬ್ಲಾಕ್‌ಚೈನ್ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...","create_batch":"ಬ್ಯಾಚ್ ರಚಿಸಿ","recent_batches":"ಇತ್ತೀಚಿನ ಬ್ಯಾಚ್‌ಗಳು","track_latest_production":"ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಉತ್ಪಾದನೆಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ","view_all":"ಎಲ್ಲವನ್ನೂ ನೋಡಿ","total_batches":"ಒಟ್ಟು ಬ್ಯಾಚ್‌ಗಳು","active_products":"ಸಕ್ರಿಯ ಉತ್ಪನ್ನಗಳು","total_sold":"ಒಟ್ಟು ಮಾರಾಟ","estimated_revenue":"ಅಂದಾಜು ಆದಾಯ","good_morning":"ಶುಭೋದಯ","good_afternoon":"ಶುಭ ಮಧ್ಯಾಹ್ನ","good_evening":"ಶುಭ ಸಂಜೆ"});}),
"[project]/locales/ml/common.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"language":"Language","select_language":"Select language","dashboard":"Dashboard","farm_management":"Farm Management","batch_tracking":"Batch Tracking","products":"Products","wallet":"Wallet","business_hub":"Business Hub","earnings":"Earnings","profile":"Profile","sign_out":"Sign Out","farmer_portal":"Farmer Portal","notifications":"Notifications","my_farms":"My Farms","manage_farm_locations":"Manage all your farm locations","add_farm":"Add Farm","add_first_farm":"Add Your First Farm","no_farms_yet":"No Farms Yet","location_gps":"Location (GPS Coordinates)","latitude":"Latitude","longitude":"Longitude","use_current_location":"Use Current Location","farm_size":"Farm Size (Acres)","pin_code":"PIN Code","soil_type":"Soil Type","organic_status":"Organic Status","farm_photo":"Farm Photo","update_farm":"Update Farm","add_new_farm":"Add New Farm","edit_farm":"Edit Farm","view_farm":"View Farm","coordinates":"Coordinates","blockchain_wallet":"Blockchain Wallet","connect_wallet_help":"Connect MetaMask and make sure you are on Sepolia.","metamask":"MetaMask","installed":"Installed","not_detected":"Not detected","wallet_address":"Wallet Address","network":"Network","not_connected":"Not connected","connect_wallet":"Connect Wallet","reconnect_wallet":"Reconnect Wallet","switch_to_sepolia":"Switch To Sepolia","refresh":"Refresh","disconnect_session":"Disconnect Session","view_on_explorer":"View On Explorer","please_wait":"Please wait...","verification_failed":"Verification Failed","invalid_qr":"Invalid QR Code","farmchain_verified":"FarmChain Verified","farm_name":"Farm Name","location":"Location","sowing_date":"Sowing Date","blockchain_status":"Blockchain Status","verified_onchain":"Verified on-chain","not_verified":"Not verified","view_on_etherscan":"View on Etherscan","farm_to_table":"Farm to Table Journey","on_chain":"On-Chain","organic":"Organic","proof":"Proof","secured_by_blockchain":"Secured by Ethereum Sepolia Blockchain","verifying_records":"Verifying Blockchain Records...","create_batch":"Create Batch","recent_batches":"Recent Batches","track_latest_production":"Track your latest production","view_all":"View All","total_batches":"Total Batches","active_products":"Active Products","total_sold":"Total Sold","estimated_revenue":"Est. Revenue","good_morning":"Good Morning","good_afternoon":"Good Afternoon","good_evening":"Good Evening"});}),
"[project]/locales/mr/common.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"language":"भाषा","select_language":"भाषा निवडा","dashboard":"डॅशबोर्ड","farm_management":"शेती व्यवस्थापन","batch_tracking":"बॅच ट्रॅकिंग","products":"उत्पादने","wallet":"वॉलेट","business_hub":"बिझनेस हब","earnings":"कमाई","profile":"प्रोफाइल","sign_out":"साइन आउट","farmer_portal":"शेतकरी पोर्टल","notifications":"सूचना","my_farms":"माझी शेतं","manage_farm_locations":"तुमची सर्व शेतांची ठिकाणे व्यवस्थापित करा","add_farm":"शेत जोडा","add_first_farm":"तुमचे पहिले शेत जोडा","no_farms_yet":"अजून शेत नाही","location_gps":"ठिकाण (GPS समन्वय)","latitude":"अक्षांश","longitude":"रेखांश","use_current_location":"सध्याचे ठिकाण वापरा","farm_size":"शेताचा आकार (एकर)","pin_code":"पिन कोड","soil_type":"मातीचा प्रकार","organic_status":"सेंद्रिय स्थिती","farm_photo":"शेताचा फोटो","update_farm":"शेत अपडेट करा","add_new_farm":"नवीन शेत जोडा","edit_farm":"शेत संपादित करा","view_farm":"शेत पहा","coordinates":"समन्वय","blockchain_wallet":"ब्लॉकचेन वॉलेट","connect_wallet_help":"MetaMask जोडा आणि तुम्ही Sepolia नेटवर्कवर आहात याची खात्री करा.","metamask":"मेटामास्क","installed":"इंस्टॉल आहे","not_detected":"सापडले नाही","wallet_address":"वॉलेट पत्ता","network":"नेटवर्क","not_connected":"कनेक्ट नाही","connect_wallet":"वॉलेट कनेक्ट करा","reconnect_wallet":"वॉलेट पुन्हा कनेक्ट करा","switch_to_sepolia":"Sepolia वर स्विच करा","refresh":"रिफ्रेश","disconnect_session":"सेशन डिस्कनेक्ट करा","view_on_explorer":"एक्सप्लोररवर पहा","please_wait":"कृपया थांबा...","verification_failed":"सत्यापन अयशस्वी","invalid_qr":"अवैध QR कोड","farmchain_verified":"FarmChain सत्यापित","farm_name":"शेताचे नाव","location":"ठिकाण","sowing_date":"पेरणी तारीख","blockchain_status":"ब्लॉकचेन स्थिती","verified_onchain":"ऑन-चेन सत्यापित","not_verified":"सत्यापित नाही","view_on_etherscan":"Etherscan वर पहा","farm_to_table":"शेतातून थाळीपर्यंत प्रवास","on_chain":"ऑन-चेन","organic":"सेंद्रिय","proof":"पुरावा","secured_by_blockchain":"Ethereum Sepolia ब्लॉकचेनने सुरक्षित","verifying_records":"ब्लॉकचेन नोंदी पडताळल्या जात आहेत...","create_batch":"बॅच तयार करा","recent_batches":"अलीकडील बॅच","track_latest_production":"तुमचे नवीन उत्पादन ट्रॅक करा","view_all":"सर्व पहा","total_batches":"एकूण बॅच","active_products":"सक्रिय उत्पादने","total_sold":"एकूण विक्री","estimated_revenue":"अंदाजित उत्पन्न","good_morning":"शुभ प्रभात","good_afternoon":"शुभ दुपार","good_evening":"शुभ संध्या"});}),
"[project]/locales/ta/common.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"language":"மொழி","select_language":"மொழியை தேர்வு செய்க","dashboard":"டாஷ்போர்ட்","farm_management":"பண்ணை மேலாண்மை","batch_tracking":"தொகுதி கண்காணிப்பு","products":"தயாரிப்புகள்","wallet":"வாலெட்","business_hub":"வணிக மையம்","earnings":"வருமானம்","profile":"சுயவிவரம்","sign_out":"வெளியேறு","farmer_portal":"விவசாயி போர்டல்","notifications":"அறிவிப்புகள்","my_farms":"என் பண்ணைகள்","manage_farm_locations":"உங்கள் அனைத்து பண்ணை இடங்களையும் நிர்வகிக்கவும்","add_farm":"பண்ணை சேர்க்கவும்","add_first_farm":"உங்கள் முதல் பண்ணையை சேர்க்கவும்","no_farms_yet":"இன்னும் பண்ணைகள் இல்லை","location_gps":"இடம் (GPS கோஆர்டினேட்கள்)","latitude":"அட்சரேகை","longitude":"தீர்க்கரேகை","use_current_location":"தற்போதைய இடத்தை பயன்படுத்து","farm_size":"பண்ணை அளவு (ஏக்கர்)","pin_code":"பின் குறியீடு","soil_type":"மண் வகை","organic_status":"ஆர்கானிக் நிலை","farm_photo":"பண்ணை படம்","update_farm":"பண்ணையை புதுப்பிக்கவும்","add_new_farm":"புதிய பண்ணை சேர்க்கவும்","edit_farm":"பண்ணையை திருத்து","view_farm":"பண்ணையை காண்க","coordinates":"கோஆர்டினேட்கள்","blockchain_wallet":"ப்ளாக்செயின் வாலெட்","connect_wallet_help":"MetaMask ஐ இணைத்து, நீங்கள் Sepoliaவில் இருப்பதை உறுதிசெய்யவும்.","metamask":"மெட்டாமாஸ்க்","installed":"நிறுவப்பட்டுள்ளது","not_detected":"கண்டறியப்படவில்லை","wallet_address":"வாலெட் முகவரி","network":"நெட்வொர்க்","not_connected":"இணைக்கப்படவில்லை","connect_wallet":"வாலெட்டை இணைக்கவும்","reconnect_wallet":"வாலெட்டை மீண்டும் இணைக்கவும்","switch_to_sepolia":"Sepoliaக்கு மாற்று","refresh":"புதுப்பி","disconnect_session":"செஷனை துண்டி","view_on_explorer":"எக்ஸ்ப்ளோரரில் காண்க","please_wait":"தயவுசெய்து காத்திருக்கவும்...","verification_failed":"சரிபார்ப்பு தோல்வி","invalid_qr":"தவறான QR குறியீடு","farmchain_verified":"FarmChain சரிபார்க்கப்பட்டது","farm_name":"பண்ணை பெயர்","location":"இடம்","sowing_date":"விதைப்பு தேதி","blockchain_status":"ப்ளாக்செயின் நிலை","verified_onchain":"ஆன்-செயின் சரிபார்க்கப்பட்டது","not_verified":"சரிபார்க்கப்படவில்லை","view_on_etherscan":"Etherscan இல் காண்க","farm_to_table":"பண்ணையிலிருந்து உணவுப்பட்டயம் வரை பயணம்","on_chain":"ஆன்-செயின்","organic":"ஆர்கானிக்","proof":"ஆதாரம்","secured_by_blockchain":"Ethereum Sepolia ப்ளாக்செயின் மூலம் பாதுகாக்கப்பட்டது","verifying_records":"ப்ளாக்செயின் பதிவுகள் சரிபார்க்கப்படுகின்றன...","create_batch":"தொகுதி உருவாக்கு","recent_batches":"சமீபத்திய தொகுதிகள்","track_latest_production":"உங்கள் சமீபத்திய உற்பத்தியை கண்காணிக்கவும்","view_all":"அனைத்தையும் காண்க","total_batches":"மொத்த தொகுதிகள்","active_products":"செயலில் உள்ள தயாரிப்புகள்","total_sold":"மொத்த விற்பனை","estimated_revenue":"மதிப்பிடப்பட்ட வருவாய்","good_morning":"காலை வணக்கம்","good_afternoon":"மதிய வணக்கம்","good_evening":"மாலை வணக்கம்"});}),
"[project]/locales/te/common.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"language":"Language","select_language":"Select language","dashboard":"Dashboard","farm_management":"Farm Management","batch_tracking":"Batch Tracking","products":"Products","wallet":"Wallet","business_hub":"Business Hub","earnings":"Earnings","profile":"Profile","sign_out":"Sign Out","farmer_portal":"Farmer Portal","notifications":"Notifications","my_farms":"My Farms","manage_farm_locations":"Manage all your farm locations","add_farm":"Add Farm","add_first_farm":"Add Your First Farm","no_farms_yet":"No Farms Yet","location_gps":"Location (GPS Coordinates)","latitude":"Latitude","longitude":"Longitude","use_current_location":"Use Current Location","farm_size":"Farm Size (Acres)","pin_code":"PIN Code","soil_type":"Soil Type","organic_status":"Organic Status","farm_photo":"Farm Photo","update_farm":"Update Farm","add_new_farm":"Add New Farm","edit_farm":"Edit Farm","view_farm":"View Farm","coordinates":"Coordinates","blockchain_wallet":"Blockchain Wallet","connect_wallet_help":"Connect MetaMask and make sure you are on Sepolia.","metamask":"MetaMask","installed":"Installed","not_detected":"Not detected","wallet_address":"Wallet Address","network":"Network","not_connected":"Not connected","connect_wallet":"Connect Wallet","reconnect_wallet":"Reconnect Wallet","switch_to_sepolia":"Switch To Sepolia","refresh":"Refresh","disconnect_session":"Disconnect Session","view_on_explorer":"View On Explorer","please_wait":"Please wait...","verification_failed":"Verification Failed","invalid_qr":"Invalid QR Code","farmchain_verified":"FarmChain Verified","farm_name":"Farm Name","location":"Location","sowing_date":"Sowing Date","blockchain_status":"Blockchain Status","verified_onchain":"Verified on-chain","not_verified":"Not verified","view_on_etherscan":"View on Etherscan","farm_to_table":"Farm to Table Journey","on_chain":"On-Chain","organic":"Organic","proof":"Proof","secured_by_blockchain":"Secured by Ethereum Sepolia Blockchain","verifying_records":"Verifying Blockchain Records...","create_batch":"Create Batch","recent_batches":"Recent Batches","track_latest_production":"Track your latest production","view_all":"View All","total_batches":"Total Batches","active_products":"Active Products","total_sold":"Total Sold","estimated_revenue":"Est. Revenue","good_morning":"Good Morning","good_afternoon":"Good Afternoon","good_evening":"Good Evening"});}),
"[project]/locales/ur/common.json (json)", ((__turbopack_context__) => {

__turbopack_context__.v({"language":"Language","select_language":"Select language","dashboard":"Dashboard","farm_management":"Farm Management","batch_tracking":"Batch Tracking","products":"Products","wallet":"Wallet","business_hub":"Business Hub","earnings":"Earnings","profile":"Profile","sign_out":"Sign Out","farmer_portal":"Farmer Portal","notifications":"Notifications","my_farms":"My Farms","manage_farm_locations":"Manage all your farm locations","add_farm":"Add Farm","add_first_farm":"Add Your First Farm","no_farms_yet":"No Farms Yet","location_gps":"Location (GPS Coordinates)","latitude":"Latitude","longitude":"Longitude","use_current_location":"Use Current Location","farm_size":"Farm Size (Acres)","pin_code":"PIN Code","soil_type":"Soil Type","organic_status":"Organic Status","farm_photo":"Farm Photo","update_farm":"Update Farm","add_new_farm":"Add New Farm","edit_farm":"Edit Farm","view_farm":"View Farm","coordinates":"Coordinates","blockchain_wallet":"Blockchain Wallet","connect_wallet_help":"Connect MetaMask and make sure you are on Sepolia.","metamask":"MetaMask","installed":"Installed","not_detected":"Not detected","wallet_address":"Wallet Address","network":"Network","not_connected":"Not connected","connect_wallet":"Connect Wallet","reconnect_wallet":"Reconnect Wallet","switch_to_sepolia":"Switch To Sepolia","refresh":"Refresh","disconnect_session":"Disconnect Session","view_on_explorer":"View On Explorer","please_wait":"Please wait...","verification_failed":"Verification Failed","invalid_qr":"Invalid QR Code","farmchain_verified":"FarmChain Verified","farm_name":"Farm Name","location":"Location","sowing_date":"Sowing Date","blockchain_status":"Blockchain Status","verified_onchain":"Verified on-chain","not_verified":"Not verified","view_on_etherscan":"View on Etherscan","farm_to_table":"Farm to Table Journey","on_chain":"On-Chain","organic":"Organic","proof":"Proof","secured_by_blockchain":"Secured by Ethereum Sepolia Blockchain","verifying_records":"Verifying Blockchain Records...","create_batch":"Create Batch","recent_batches":"Recent Batches","track_latest_production":"Track your latest production","view_all":"View All","total_batches":"Total Batches","active_products":"Active Products","total_sold":"Total Sold","estimated_revenue":"Est. Revenue","good_morning":"Good Morning","good_afternoon":"Good Afternoon","good_evening":"Good Evening"});}),
"[project]/src/lib/i18n.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SUPPORTED_LANGUAGES",
    ()=>SUPPORTED_LANGUAGES,
    "applyDocumentLanguage",
    ()=>applyDocumentLanguage,
    "default",
    ()=>__TURBOPACK__default__export__,
    "initializeI18n",
    ()=>initializeI18n,
    "persistLanguage",
    ()=>persistLanguage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$i18next$2f$dist$2f$esm$2f$i18next$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/i18next/dist/esm/i18next.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$i18next$2f$dist$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-i18next/dist/es/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$i18next$2f$dist$2f$es$2f$initReactI18next$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-i18next/dist/es/initReactI18next.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$en$2f$common$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/en/common.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$bn$2f$common$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/bn/common.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$hi$2f$common$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/hi/common.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$kn$2f$common$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/kn/common.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$ml$2f$common$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/ml/common.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$mr$2f$common$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/mr/common.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$ta$2f$common$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/ta/common.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$te$2f$common$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/te/common.json (json)");
var __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$ur$2f$common$2e$json__$28$json$29$__ = __turbopack_context__.i("[project]/locales/ur/common.json (json)");
'use client';
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
const STORAGE_KEY = 'farmchain_language';
const SUPPORTED_LANGUAGES = [
    'en',
    'bn',
    'hi',
    'kn',
    'ml',
    'mr',
    'ta',
    'te',
    'ur'
];
function getInitialLanguage() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
        return stored;
    }
    const browserLang = (navigator.language || 'en').toLowerCase().split('-')[0];
    return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en';
}
function persistLanguage(language) {
    if ("TURBOPACK compile-time truthy", 1) {
        localStorage.setItem(STORAGE_KEY, language);
    }
}
function applyDocumentLanguage(language) {
    if (typeof document === 'undefined') {
        return;
    }
    document.documentElement.lang = language || 'en';
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
}
function initializeI18n() {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$i18next$2f$dist$2f$esm$2f$i18next$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isInitialized) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$i18next$2f$dist$2f$esm$2f$i18next$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    }
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$i18next$2f$dist$2f$esm$2f$i18next$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].use(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$i18next$2f$dist$2f$es$2f$initReactI18next$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initReactI18next"]).init({
        resources: {
            en: {
                common: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$en$2f$common$2e$json__$28$json$29$__["default"]
            },
            bn: {
                common: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$bn$2f$common$2e$json__$28$json$29$__["default"]
            },
            hi: {
                common: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$hi$2f$common$2e$json__$28$json$29$__["default"]
            },
            kn: {
                common: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$kn$2f$common$2e$json__$28$json$29$__["default"]
            },
            ml: {
                common: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$ml$2f$common$2e$json__$28$json$29$__["default"]
            },
            mr: {
                common: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$mr$2f$common$2e$json__$28$json$29$__["default"]
            },
            ta: {
                common: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$ta$2f$common$2e$json__$28$json$29$__["default"]
            },
            te: {
                common: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$te$2f$common$2e$json__$28$json$29$__["default"]
            },
            ur: {
                common: __TURBOPACK__imported__module__$5b$project$5d2f$locales$2f$ur$2f$common$2e$json__$28$json$29$__["default"]
            }
        },
        lng: getInitialLanguage(),
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: [
            'common'
        ],
        react: {
            useSuspense: false
        },
        interpolation: {
            escapeValue: false
        },
        returnNull: false,
        returnEmptyString: false
    });
    persistLanguage(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$i18next$2f$dist$2f$esm$2f$i18next$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].language);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$i18next$2f$dist$2f$esm$2f$i18next$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
}
initializeI18n();
const __TURBOPACK__default__export__ = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$i18next$2f$dist$2f$esm$2f$i18next$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/common/I18nProvider.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>I18nProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$i18next$2f$dist$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/react-i18next/dist/es/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$i18next$2f$dist$2f$es$2f$I18nextProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-i18next/dist/es/I18nextProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/i18n.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function I18nProvider({ children }) {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "I18nProvider.useEffect": ()=>{
            const instance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeI18n"])();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyDocumentLanguage"])(instance.language);
            const onLanguageChanged = {
                "I18nProvider.useEffect.onLanguageChanged": (lng)=>{
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["applyDocumentLanguage"])(lng);
                }
            }["I18nProvider.useEffect.onLanguageChanged"];
            instance.on('languageChanged', onLanguageChanged);
            return ({
                "I18nProvider.useEffect": ()=>{
                    instance.off('languageChanged', onLanguageChanged);
                }
            })["I18nProvider.useEffect"];
        }
    }["I18nProvider.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$i18next$2f$dist$2f$es$2f$I18nextProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["I18nextProvider"], {
        i18n: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$i18n$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/common/I18nProvider.js",
        lineNumber: 23,
        columnNumber: 10
    }, this);
}
_s(I18nProvider, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = I18nProvider;
var _c;
__turbopack_context__.k.register(_c, "I18nProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_c65c4305._.js.map