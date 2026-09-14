"use strict";
// src/app/components/shared/header/header.ts
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var theme_1 = require("../../../services/theme");
var sales_service_1 = require("../../../services/sales.service");
var preferences_1 = require("../../../services/preferences");
var produit_store_service_1 = require("../../../service/store/product/produit-store.service");
var user_store_service_1 = require("../../../service/store/user/user-store.service");
var notifications_bell_1 = require("./notifications-bell/notifications-bell");
var common_1 = require("@angular/common");
var Header = function () {
    var _classDecorators = [(0, core_1.Component)({
            selector: 'app-header',
            standalone: true,
            imports: [notifications_bell_1.NotificationsBell, common_1.UpperCasePipe],
            templateUrl: './header.html',
            styleUrls: ['./header.css']
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _onDocumentClick_decorators;
    var _onEscape_decorators;
    var Header = _classThis = /** @class */ (function () {
        function Header_1() {
            var _this = this;
            this.menuToggle = (__runInitializers(this, _instanceExtraInitializers), (0, core_1.output)());
            this.themeService = (0, core_1.inject)(theme_1.ThemeService);
            this.router = (0, core_1.inject)(router_1.Router);
            this.elementRef = (0, core_1.inject)(core_1.ElementRef);
            this.produitStore = (0, core_1.inject)(produit_store_service_1.ProduitStoreService);
            this.salesService = (0, core_1.inject)(sales_service_1.SalesService);
            this.prefs = (0, core_1.inject)(preferences_1.PreferencesService);
            this.userStore = (0, core_1.inject)(user_store_service_1.UserStoreService);
            this.profileImageError = (0, core_1.signal)(false);
            this.searchTerm = (0, core_1.signal)('');
            // ✅ NOUVEAU : Popup de recherche
            this.searchPopupOpen = (0, core_1.signal)(false);
            this.ventes = this.salesService.sales;
            this.searchResults = (0, core_1.computed)(function () {
                var _a;
                var terme = _this.searchTerm().trim().toLowerCase();
                if (!terme)
                    return [];
                var results = [];
                var produits = (_a = _this.produitStore.produits()) !== null && _a !== void 0 ? _a : [];
                for (var _i = 0, produits_1 = produits; _i < produits_1.length; _i++) {
                    var produit = produits_1[_i];
                    var correspond = produit.nom.toLowerCase().includes(terme) ||
                        produit.reference.toLowerCase().includes(terme) ||
                        produit.categorie.toLowerCase().includes(terme);
                    if (correspond) {
                        results.push({
                            type: 'produit',
                            id: produit.id,
                            title: produit.nom,
                            subtitle: "".concat(produit.reference, " \u00B7 ").concat(produit.categorie),
                            produit: produit
                        });
                    }
                }
                for (var _b = 0, _c = _this.ventes(); _b < _c.length; _b++) {
                    var vente = _c[_b];
                    var produitNom = vente.product || (vente.items && vente.items.length > 0 ? vente.items[0].productName : 'Vente');
                    var clientNom = vente.client || vente.customerName || 'Client comptant';
                    var correspond = produitNom.toLowerCase().includes(terme) ||
                        clientNom.toLowerCase().includes(terme);
                    if (correspond) {
                        results.push({
                            type: 'vente',
                            id: vente.id,
                            title: produitNom,
                            subtitle: "Vente \u00B7 ".concat(clientNom),
                            vente: vente
                        });
                    }
                }
                return results.slice(0, 8);
            });
            // ============================================================
            // PROFIL
            // ============================================================
            this.profileOpen = (0, core_1.signal)(false);
        }
        // ✅ OUVRE LE POPUP DE RECHERCHE
        Header_1.prototype.openSearchPopup = function () {
            this.searchPopupOpen.set(true);
            // Focus sur l'input après l'ouverture
            setTimeout(function () {
                var input = document.querySelector('.bk-search-popup__input');
                if (input)
                    input.focus();
            }, 100);
        };
        // ✅ FERME LE POPUP DE RECHERCHE
        Header_1.prototype.closeSearchPopup = function () {
            this.searchPopupOpen.set(false);
        };
        Header_1.prototype.toggleMenu = function () {
            this.menuToggle.emit();
        };
        Header_1.prototype.onSearch = function (event) {
            var input = event.target;
            this.searchTerm.set(input.value);
        };
        Header_1.prototype.clearSearch = function () {
            this.searchTerm.set('');
        };
        Header_1.prototype.onSearchKeydown = function (event) {
            if (event.key === 'Enter') {
                var premier = this.searchResults()[0];
                if (premier) {
                    this.openResult(premier);
                    this.closeSearchPopup();
                }
            }
        };
        Header_1.prototype.openResult = function (result) {
            this.searchTerm.set('');
            if (result.type === 'produit') {
                this.router.navigate(['/catalogue']);
                return;
            }
            if (result.type === 'vente') {
                this.router.navigate(['/ventes']);
            }
        };
        Header_1.prototype.openCatalogue = function () {
            this.clearSearch();
            this.router.navigate(['/catalogue']);
        };
        Header_1.prototype.toggleProfile = function () {
            this.profileOpen.update(function (v) { return !v; });
        };
        Header_1.prototype.logout = function () {
            this.profileOpen.set(false);
            this.router.navigate(['/connexion']);
        };
        // ============================================================
        // FERMETURE AU CLIC EXTÉRIEUR
        // ============================================================
        Header_1.prototype.onDocumentClick = function (event) {
            var clickedInside = this.elementRef.nativeElement.contains(event.target);
            if (!clickedInside) {
                this.profileOpen.set(false);
                // Ne pas fermer le popup automatiquement, l'utilisateur doit cliquer sur la croix ou le backdrop
            }
        };
        // ✅ FERMER LE POPUP AVEC ÉCHAP
        Header_1.prototype.onEscape = function () {
            if (this.searchPopupOpen()) {
                this.closeSearchPopup();
            }
        };
        Object.defineProperty(Header_1.prototype, "pageTitle", {
            // ============================================================
            // TITRE DE PAGE
            // ============================================================
            get: function () {
                var url = this.router.url;
                if (url.startsWith('/catalogue'))
                    return 'Catalogue & Stocks';
                if (url.startsWith('/ventes'))
                    return 'Gestion des ventes';
                if (url.startsWith('/charges'))
                    return 'Gestion des charges';
                if (url.startsWith('/documents'))
                    return 'Documents';
                return 'Tableau de bord';
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(Header_1.prototype, "breadcrumbCurrent", {
            get: function () {
                var url = this.router.url;
                if (url.startsWith('/catalogue'))
                    return 'Catalogue';
                if (url.startsWith('/ventes'))
                    return 'Ventes';
                if (url.startsWith('/charges'))
                    return 'Charges';
                if (url.startsWith('/documents'))
                    return 'Documents';
                return 'Accueil';
            },
            enumerable: false,
            configurable: true
        });
        return Header_1;
    }());
    __setFunctionName(_classThis, "Header");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _onDocumentClick_decorators = [(0, core_1.HostListener)('document:click', ['$event'])];
        _onEscape_decorators = [(0, core_1.HostListener)('document:keydown.escape')];
        __esDecorate(_classThis, null, _onDocumentClick_decorators, { kind: "method", name: "onDocumentClick", static: false, private: false, access: { has: function (obj) { return "onDocumentClick" in obj; }, get: function (obj) { return obj.onDocumentClick; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _onEscape_decorators, { kind: "method", name: "onEscape", static: false, private: false, access: { has: function (obj) { return "onEscape" in obj; }, get: function (obj) { return obj.onEscape; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Header = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Header = _classThis;
}();
exports.Header = Header;
