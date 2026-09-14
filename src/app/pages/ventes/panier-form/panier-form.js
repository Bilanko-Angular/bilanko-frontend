"use strict";
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
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanierForm = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var produit_service_1 = require("../../../services/produit.service");
var preferences_1 = require("../../../services/preferences");
var PanierForm = function () {
    var _classDecorators = [(0, core_1.Component)({
            selector: 'app-panier-form',
            standalone: true,
            imports: [forms_1.FormsModule, common_1.CurrencyPipe],
            templateUrl: './panier-form.html',
            styleUrl: './panier-form.css',
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _initial_decorators;
    var _initial_initializers = [];
    var _initial_extraInitializers = [];
    var _submitSale_decorators;
    var _submitSale_initializers = [];
    var _submitSale_extraInitializers = [];
    var _cancel_decorators;
    var _cancel_initializers = [];
    var _cancel_extraInitializers = [];
    var PanierForm = _classThis = /** @class */ (function () {
        function PanierForm_1() {
            var _this = this;
            this.prefs = (0, core_1.inject)(preferences_1.PreferencesService);
            this.produitService = (0, core_1.inject)(produit_service_1.ProduitService);
            this.initial = __runInitializers(this, _initial_initializers, null);
            this.submitSale = (__runInitializers(this, _initial_extraInitializers), __runInitializers(this, _submitSale_initializers, new core_1.EventEmitter()));
            this.cancel = (__runInitializers(this, _submitSale_extraInitializers), __runInitializers(this, _cancel_initializers, new core_1.EventEmitter()));
            this.catalogue = (__runInitializers(this, _cancel_extraInitializers), this.produitService.catalogue);
            this.customerName = (0, core_1.signal)('');
            // Format attendu par <input type="datetime-local"> : yyyy-MM-ddTHH:mm
            this.saleDateTime = (0, core_1.signal)(this.toLocalDateTimeInput(new Date()));
            this.panier = (0, core_1.signal)([]);
            // --- Recherche de produit (remplace le <select> qui ne permettait pas de taper) ---
            this.productQuery = (0, core_1.signal)('');
            this.showSuggestions = (0, core_1.signal)(false);
            this.selectedProductId = (0, core_1.signal)('');
            this.selectedQuantity = (0, core_1.signal)(1);
            this.stockWarning = (0, core_1.signal)('');
            this.filteredProducts = (0, core_1.computed)(function () {
                var _a;
                var q = _this.productQuery().trim().toLowerCase();
                var list = (_a = _this.catalogue.value()) !== null && _a !== void 0 ? _a : [];
                if (!q)
                    return list;
                return list.filter(function (p) {
                    return p.nom.toLowerCase().includes(q) ||
                        p.reference.toLowerCase().includes(q) ||
                        p.categorie.toLowerCase().includes(q);
                });
            });
            this.produitSelectionne = (0, core_1.computed)(function () {
                var _a;
                var id = _this.selectedProductId();
                return ((_a = _this.catalogue.value()) !== null && _a !== void 0 ? _a : []).find(function (p) { return p.id === id; });
            });
            this.total = (0, core_1.computed)(function () {
                return _this.panier().reduce(function (sum, item) { return sum + item.unitSellingPrice * item.quantity; }, 0);
            });
            this.totalMargin = (0, core_1.computed)(function () {
                return _this.panier().reduce(function (sum, item) { var _a; return sum + ((_a = item.margin) !== null && _a !== void 0 ? _a : 0); }, 0);
            });
            (0, core_1.effect)(function () {
                if (_this.initial) {
                    _this.customerName.set(_this.initial.customerName);
                    _this.saleDateTime.set(_this.toLocalDateTimeInput(new Date(_this.initial.saleDate)));
                    _this.panier.set(__spreadArray([], _this.initial.items, true));
                }
            });
        }
        PanierForm_1.prototype.toLocalDateTimeInput = function (date) {
            var pad = function (n) { return String(n).padStart(2, '0'); };
            return "".concat(date.getFullYear(), "-").concat(pad(date.getMonth() + 1), "-").concat(pad(date.getDate()), "T").concat(pad(date.getHours()), ":").concat(pad(date.getMinutes()));
        };
        PanierForm_1.prototype.onProductQueryChange = function (value) {
            var _a;
            this.productQuery.set(value);
            this.showSuggestions.set(true);
            // Si le texte tapé correspond exactement à un produit du catalogue, on le
            // sélectionne automatiquement. Sinon on attend un clic explicite sur une
            // suggestion, ce qui empêche d'ajouter un produit inexistant.
            var match = ((_a = this.catalogue.value()) !== null && _a !== void 0 ? _a : []).find(function (p) { return p.nom.toLowerCase() === value.trim().toLowerCase(); });
            this.selectedProductId.set(match ? match.id : '');
        };
        PanierForm_1.prototype.onProductFocus = function () {
            this.showSuggestions.set(true);
        };
        PanierForm_1.prototype.onProductBlur = function () {
            var _this = this;
            // Petit délai pour laisser le (mousedown) de la liste se déclencher
            // avant que la liste ne se ferme (sinon le clic sur une suggestion
            // n'a jamais le temps d'être capté).
            setTimeout(function () { return _this.showSuggestions.set(false); }, 150);
        };
        PanierForm_1.prototype.selectProduct = function (p) {
            this.selectedProductId.set(p.id);
            this.productQuery.set(p.nom);
            this.showSuggestions.set(false);
        };
        PanierForm_1.prototype.ajouterAuPanier = function () {
            var produit = this.produitSelectionne();
            var qty = this.selectedQuantity();
            this.stockWarning.set('');
            if (!produit)
                return;
            var dejaDansPanier = this.panier()
                .filter(function (i) { return i.productId === produit.id; })
                .reduce(function (s, i) { return s + i.quantity; }, 0);
            if (dejaDansPanier + qty > produit.quantiteStock) {
                this.stockWarning.set("".concat(this.prefs.t().invalidQuantity, " (").concat(this.prefs.t().stockQty, ": ").concat(produit.quantiteStock, ")"));
                return;
            }
            var margeUnitaire = produit.prixVente - produit.prixAchat;
            this.panier.update(function (curr) { return __spreadArray(__spreadArray([], curr, true), [
                {
                    productId: produit.id,
                    productName: produit.nom,
                    quantity: qty,
                    unitSellingPrice: produit.prixVente,
                    unitPurchasePrice: produit.prixAchat,
                    margin: margeUnitaire * qty,
                }
            ], false); });
            this.selectedProductId.set('');
            this.productQuery.set('');
            this.selectedQuantity.set(1);
        };
        PanierForm_1.prototype.retirerDuPanier = function (index) {
            this.panier.update(function (curr) { return curr.filter(function (_, i) { return i !== index; }); });
        };
        PanierForm_1.prototype.onSubmit = function () {
            if (this.panier().length === 0)
                return;
            this.submitSale.emit({
                customerName: this.customerName().trim() || this.prefs.t().comptantClient,
                saleDate: new Date(this.saleDateTime()).toISOString(),
                totalAmount: this.total(),
                totalMargin: this.totalMargin(),
                items: this.panier(),
            });
        };
        return PanierForm_1;
    }());
    __setFunctionName(_classThis, "PanierForm");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _initial_decorators = [(0, core_1.Input)()];
        _submitSale_decorators = [(0, core_1.Output)()];
        _cancel_decorators = [(0, core_1.Output)()];
        __esDecorate(null, null, _initial_decorators, { kind: "field", name: "initial", static: false, private: false, access: { has: function (obj) { return "initial" in obj; }, get: function (obj) { return obj.initial; }, set: function (obj, value) { obj.initial = value; } }, metadata: _metadata }, _initial_initializers, _initial_extraInitializers);
        __esDecorate(null, null, _submitSale_decorators, { kind: "field", name: "submitSale", static: false, private: false, access: { has: function (obj) { return "submitSale" in obj; }, get: function (obj) { return obj.submitSale; }, set: function (obj, value) { obj.submitSale = value; } }, metadata: _metadata }, _submitSale_initializers, _submitSale_extraInitializers);
        __esDecorate(null, null, _cancel_decorators, { kind: "field", name: "cancel", static: false, private: false, access: { has: function (obj) { return "cancel" in obj; }, get: function (obj) { return obj.cancel; }, set: function (obj, value) { obj.cancel = value; } }, metadata: _metadata }, _cancel_initializers, _cancel_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        PanierForm = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return PanierForm = _classThis;
}();
exports.PanierForm = PanierForm;
