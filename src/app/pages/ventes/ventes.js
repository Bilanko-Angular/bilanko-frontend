"use strict";
// src/app/pages/ventes/ventes.ts
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesComponent = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
var template_1 = require("../../components/shared/template/template");
var confirm_1 = require("../../components/shared/confirm/confirm");
var action_menu_1 = require("../../components/shared/action-menu/action-menu");
var panier_form_1 = require("./panier-form/panier-form");
var sales_service_1 = require("../../services/sales.service");
var preferences_1 = require("../../services/preferences");
var SalesComponent = function () {
    var _classDecorators = [(0, core_1.Component)({
            selector: 'app-ventes',
            standalone: true,
            imports: [common_1.DatePipe, common_1.CurrencyPipe, forms_1.FormsModule, template_1.Template, confirm_1.ConfirmDialog, action_menu_1.ActionMenu, panier_form_1.PanierForm],
            templateUrl: './ventes.html',
            styleUrls: ['./ventes.css'],
            changeDetection: core_1.ChangeDetectionStrategy.OnPush
        })];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var SalesComponent = _classThis = /** @class */ (function () {
        function SalesComponent_1() {
            var _this = this;
            this.salesService = (0, core_1.inject)(sales_service_1.SalesService);
            this.router = (0, core_1.inject)(router_1.Router);
            this.prefs = (0, core_1.inject)(preferences_1.PreferencesService);
            this.isAddModalOpen = (0, core_1.signal)(false);
            this.isFilterModalOpen = (0, core_1.signal)(false);
            this.confirmDeleteId = (0, core_1.signal)(null);
            this.editingSale = null;
            this.sales = this.salesService.sales;
            // --- BARRE DE RECHERCHE (RAPIDE) ---
            this.searchTerm = (0, core_1.signal)(''); // Texte tapé dans la barre de recherche
            this.filteredBySearch = (0, core_1.computed)(function () {
                var term = _this.searchTerm().trim().toLowerCase();
                if (!term)
                    return _this.sales();
                return _this.sales().filter(function (s) {
                    return s.customerName.toLowerCase().includes(term) ||
                        s.items.some(function (i) { return i.productName.toLowerCase().includes(term); }) ||
                        s.id.toLowerCase().includes(term);
                });
            });
            // --- FILTRE AVANCÉ (Modale) ---
            this.filterSearchTerm = (0, core_1.signal)('');
            this.filterDate = (0, core_1.signal)('');
            this.appliedSearchTerm = (0, core_1.signal)('');
            this.appliedDate = (0, core_1.signal)('');
            // Combine recherche rapide + filtres avancés
            this.filteredSales = (0, core_1.computed)(function () {
                var term = _this.appliedSearchTerm().trim().toLowerCase();
                var date = _this.appliedDate();
                var results = _this.filteredBySearch(); // Déjà filtré par la recherche rapide
                // Appliquer le filtre avancé par texte (si différent de la recherche rapide)
                if (term && _this.searchTerm().trim().toLowerCase() !== term) {
                    results = results.filter(function (s) {
                        return s.customerName.toLowerCase().includes(term) ||
                            s.items.some(function (i) { return i.productName.toLowerCase().includes(term); });
                    });
                }
                // Filtrer par date
                if (date) {
                    results = results.filter(function (s) { return s.saleDate.startsWith(date); });
                }
                return results;
            });
            // --- Indicateur de filtre actif ---
            this.hasActiveFilter = (0, core_1.computed)(function () {
                return _this.searchTerm().trim().length > 0 ||
                    _this.appliedSearchTerm().trim().length > 0 ||
                    _this.appliedDate().length > 0;
            });
            // --- Pagination ---
            this.pageCourante = (0, core_1.signal)(1);
            this.parPage = 6;
            this.nombrePages = (0, core_1.computed)(function () {
                return Math.max(1, Math.ceil(_this.filteredSales().length / _this.parPage));
            });
            this.salesPage = (0, core_1.computed)(function () {
                var debut = (_this.pageCourante() - 1) * _this.parPage;
                return _this.filteredSales().slice(debut, debut + _this.parPage);
            });
            (0, core_1.effect)(function () {
                var max = _this.nombrePages();
                if (_this.pageCourante() > max)
                    _this.pageCourante.set(max);
            });
        }
        // --- Actions de recherche ---
        SalesComponent_1.prototype.onSearchChange = function (value) {
            this.searchTerm.set(value);
            this.pageCourante.set(1);
        };
        SalesComponent_1.prototype.clearSearch = function () {
            this.searchTerm.set('');
            this.pageCourante.set(1);
        };
        // --- Filtres avancés ---
        SalesComponent_1.prototype.applyFilter = function () {
            this.appliedSearchTerm.set(this.filterSearchTerm());
            this.appliedDate.set(this.filterDate());
            this.pageCourante.set(1);
            this.closeFilterModal();
        };
        SalesComponent_1.prototype.resetFilter = function () {
            this.filterSearchTerm.set('');
            this.filterDate.set('');
            this.appliedSearchTerm.set('');
            this.appliedDate.set('');
            this.searchTerm.set('');
            this.pageCourante.set(1);
            this.closeFilterModal();
        };
        // --- Pagination ---
        SalesComponent_1.prototype.pageSuivante = function () {
            var _this = this;
            this.pageCourante.update(function (v) { return Math.min(v + 1, _this.nombrePages()); });
        };
        SalesComponent_1.prototype.pagePrecedente = function () { this.pageCourante.update(function (v) { return Math.max(v - 1, 1); }); };
        // --- Modales ---
        SalesComponent_1.prototype.openAddModal = function () { this.editingSale = null; this.isAddModalOpen.set(true); };
        SalesComponent_1.prototype.closeAddModal = function () { this.isAddModalOpen.set(false); this.editingSale = null; };
        SalesComponent_1.prototype.openFilterModal = function () {
            this.filterSearchTerm.set(this.appliedSearchTerm());
            this.filterDate.set(this.appliedDate());
            this.isFilterModalOpen.set(true);
        };
        SalesComponent_1.prototype.closeFilterModal = function () { this.isFilterModalOpen.set(false); };
        SalesComponent_1.prototype.voirVente = function (id) {
            this.router.navigate(['/ventes', id]);
        };
        SalesComponent_1.prototype.editSale = function (id) {
            var s = this.salesService.getById(id) || null;
            if (s) {
                this.editingSale = s;
                this.isAddModalOpen.set(true);
            }
        };
        SalesComponent_1.prototype.onRowAction = function (actionType, id) {
            if (actionType === 'view')
                this.voirVente(id);
            if (actionType === 'edit')
                this.editSale(id);
            if (actionType === 'delete')
                this.confirmDeleteId.set(id);
        };
        SalesComponent_1.prototype.confirmDelete = function () {
            var id = this.confirmDeleteId();
            if (id)
                this.salesService.delete(id);
            this.confirmDeleteId.set(null);
        };
        SalesComponent_1.prototype.cancelDelete = function () { this.confirmDeleteId.set(null); };
        SalesComponent_1.prototype.handleSaleSubmit = function (payload) {
            if (this.editingSale) {
                this.salesService.update(this.editingSale.id, payload);
            }
            else {
                this.salesService.add(payload);
            }
            this.closeAddModal();
        };
        return SalesComponent_1;
    }());
    __setFunctionName(_classThis, "SalesComponent");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        SalesComponent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return SalesComponent = _classThis;
}();
exports.SalesComponent = SalesComponent;
