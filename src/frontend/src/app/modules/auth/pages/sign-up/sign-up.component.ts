import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../../common/service/authentication.service';
import { NavigationService } from '../../../dashboard/service/navigation.service';

import {
	containsLowercaseCharacter,
	containsNumber,
	containsSpecialCharacter,
	containsUppercaseCharacter,
} from 'src/app/modules/common/validators';
import { catchError, mapTo, Observable, of, switchMap, tap } from 'rxjs';
export interface UserInfo {
	first_name: FormControl<string>;
	last_name: FormControl<string>;
	email: FormControl<string>;
	password: FormControl<string>;
	track_events: FormControl<boolean>;
	news_letter: FormControl<boolean>;
}
@Component({
	templateUrl: './sign-up.component.html',
	styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
	registrationForm: FormGroup<UserInfo>;
	submitted = false;
	loading = false;
	tokenError = false;
	emailExists = false;
	emailChanged = false;
	signUp$: Observable<void>;
	constructor(
		private formBuilder: UntypedFormBuilder,
		private router: Router,
		private navigationService: NavigationService,
		public authenticationService: AuthenticationService
	) {
		this.registrationForm = this.formBuilder.group({
			first_name: ['', [Validators.required]],
			last_name: ['', [Validators.required]],
			email: [, [Validators.email, Validators.pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'), Validators.required]],
			password: [
				'',
				[
					Validators.required,
					Validators.minLength(8),
					Validators.maxLength(64),
					containsSpecialCharacter(),
					containsUppercaseCharacter(),
					containsLowercaseCharacter(),
					containsNumber(),
				],
			],
			track_events: [false],
			news_letter: [false],
		});
	}

	ngOnInit(): void {
		this.navigationService.setTitle('Email Registration');
	}

	signUp() {
		this.submitted = true;
		if (this.registrationForm.valid && !this.loading) {
			this.loading = true;
			const request = this.registrationForm.getRawValue();
			this.signUp$ = this.authenticationService.signUp(request).pipe(
				tap(response => {
					this.authenticationService.saveToken(response);
					this.authenticationService.saveUser(response);
				}),
				switchMap(() => {
					return this.authenticationService.saveNewsLetterSubscriber(request.email);
				}),
				catchError(err => {
					console.error(err);
					return of(void 0);
				}),
				tap(() => {
					this.router.navigate(['/flows']);
				}),
				mapTo(void 0)
			);
		}
	}

	getPasswordError(errorName: string) {
		return this.registrationForm.get('password')?.hasError(errorName);
	}

	isPasswordInputIsFocused(passwordInputElement: HTMLInputElement) {
		return passwordInputElement == document.activeElement;
	}
}
