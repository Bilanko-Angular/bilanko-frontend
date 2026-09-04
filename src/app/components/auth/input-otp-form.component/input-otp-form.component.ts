import { afterNextRender, Component, computed, ElementRef, type OnDestroy, QueryList, signal, ViewChildren, output, input } from '@angular/core';
import { form, FormRoot, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';

@Component({
	selector: 'app-input-otp-form',
	standalone: true,
	imports: [FormRoot],
	templateUrl: './input-otp-form.component.html',
	styleUrl: './input-otp-form.component.css',
})
export class InputOtpFormComponent implements OnDestroy {
	private _intervalId?: ReturnType<typeof setInterval>;

	@ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

	public readonly countdown = signal(60);
	public readonly isResendDisabled = computed(() => this.countdown() > 0);
	public readonly toastMessage = signal<string | null>(null);

	public readonly maxLength = 6;
	public readonly otpIndexes = Array.from({ length: this.maxLength }, (_, i) => i);
	public readonly otpDigits = signal<string[]>(Array(this.maxLength).fill(''));

	public readonly otpVerified = output<string>();
	public readonly restart = output<void>();
	public readonly email = input<string>('');
	private attempts = 0;
	private readonly http = inject(HttpClient);

	private readonly _model = signal({
		otp: '',
	});

	public readonly form = form(
		this._model,
		(schemaPath) => {
			required(schemaPath.otp, { message: 'Le code est requis' });
			minLength(schemaPath.otp, this.maxLength, { message: `Le code doit contenir ${this.maxLength} chiffres` });
			maxLength(schemaPath.otp, this.maxLength, { message: `Le code doit contenir ${this.maxLength} chiffres` });
		},
		{
			submission: {
				action: async () => {
					const model = this._model();
					try {
						const res = await firstValueFrom(this.http.post<any>(`${environment.baseApiUrl}/auth/password/verify-otp`, {
							email: this.email(),
							otp: model.otp
						}));
						if (res.success) {
							this.toastMessage.set(res.message || `Votre code a été soumis et validé.`);
							setTimeout(() => this.otpVerified.emit(res.token), 1000);
						} else {
							this.handleInvalidOtp(res.message);
						}
					} catch (err: any) {
						this.handleInvalidOtp(err.error?.message || 'Erreur lors de la vérification.');
					}
				},
			},
		},
	);

	constructor() {
		afterNextRender(() => this.startCountdown());
	}

	onDigitInput(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		const value = input.value.replace(/[^0-9]/g, '').slice(-1);

		const digits = [...this.otpDigits()];
		digits[index] = value;
		this.otpDigits.set(digits);
		this._syncModel();

		if (value && index < this.maxLength - 1) {
			this.otpInputs.get(index + 1)?.nativeElement.focus();
		}

		if (digits.every((d) => d.length === 1)) {
			this.submit();
		}
	}

	onKeydown(event: KeyboardEvent, index: number) {
		if (event.key === 'Backspace' && !this.otpDigits()[index] && index > 0) {
			this.otpInputs.get(index - 1)?.nativeElement.focus();
		}
	}

	onPaste(event: ClipboardEvent) {
		event.preventDefault();
		const pasted = event.clipboardData?.getData('text').replaceAll('-', '').replace(/[^0-9]/g, '') ?? '';
		const digits = pasted.slice(0, this.maxLength).split('');
		this.otpDigits.set([...digits, ...Array(this.maxLength - digits.length).fill('')]);
		this._syncModel();

		const lastFilledIndex = Math.min(digits.length, this.maxLength - 1);
		this.otpInputs.get(lastFilledIndex)?.nativeElement.focus();

		if (digits.length === this.maxLength) {
			this.submit();
		}
	}

	submit() {
		submit(this.form);
	}

	resendOtp() {
		this.http.post<any>(`${environment.baseApiUrl}/auth/password/forgot`, { email: this.email() })
			.subscribe({
				next: () => {
					this.toastMessage.set('Code renvoyé avec succès.');
					this.resetCountdown();
				},
				error: () => {
					this.toastMessage.set('Erreur lors du renvoi du code.');
				}
			});
	}

	private handleInvalidOtp(msg: string) {
		this.attempts++;
		if (this.attempts >= 5) {
			this.toastMessage.set('Trop de tentatives échouées. Veuillez recommencer.');
			setTimeout(() => this.restart.emit(), 2000);
		} else {
			this.toastMessage.set(msg || `Code invalide. Tentative ${this.attempts}/5`);
		}
	}

	ngOnDestroy() {
		this.stopCountdown();
	}

	private _syncModel() {
		this._model.set({ otp: this.otpDigits().join('') });
	}

	private resetCountdown() {
		this.countdown.set(60);
		this.startCountdown();
	}

	private startCountdown() {
		this.stopCountdown();
		this._intervalId = setInterval(() => {
			this.countdown.update((c) => Math.max(0, c - 1));
			if (this.countdown() === 0) {
				this.stopCountdown();
			}
		}, 1000);
	}

	private stopCountdown() {
		if (this._intervalId) {
			clearInterval(this._intervalId);
			this._intervalId = undefined;
		}
	}
}