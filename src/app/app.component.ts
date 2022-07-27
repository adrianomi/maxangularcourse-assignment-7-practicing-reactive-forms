import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { Observable, of, timer } from "rxjs";
import { debounceTime, switchMap } from "rxjs/operators";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent implements OnInit {
  projectForm: FormGroup;
  statuses = ["Stable", "Critical", "Finished"];
  currentGlyphicon = null;

  showNameHelpBlock = false;
  showEmailHelpBlock = false;
  disableSubmitButton = true;

  nameFieldErrors: string[] = [];
  emailFieldErrors: string[] = [];

  ngOnInit(): void {
    this.initForm();
    this.startListeningForm();
  }

  initForm(): void {
    this.projectForm = new FormGroup({
      name: new FormControl(
        null,
        [Validators.required],
        [this.forbiddenProjectNameAsyncValidator]
      ),
      email: new FormControl(null, [Validators.required, Validators.email]),
      status: new FormControl(null),
    });
  }

  startListeningForm() {
    this.projectForm.statusChanges
      .subscribe(this.onProjectFormStatusChanges);

    this.projectForm
      .get("name")
      .statusChanges.pipe(debounceTime(500))
      .subscribe(this.onProjectNameStatusChanges);

    this.projectForm
      .get("email")
      .statusChanges.pipe(debounceTime(500))
      .subscribe(this.onProjectEmailStatusChanges);
  }

  onProjectFormStatusChanges = (status: string): void => {
    if (status === "VALID") this.disableSubmitButton = false;
    else this.disableSubmitButton = true;
  };

  onProjectNameStatusChanges = (status: string): void => {
    if (status === "INVALID") {
      this.showNameHelpBlock = true;
      this.nameFieldErrors = this.getErrorMessages("name");
    } else this.showNameHelpBlock = false;

    const statusGlyphicons = {
      INVALID: "glyphicon glyphicon-remove invalid-red",
      PENDING: "glyphicon glyphicon-refresh rotate neutral-gray",
      VALID: "glyphicon glyphicon-ok ok-green",
    };

    let glyphicon = null;
    if (status in statusGlyphicons) {
      glyphicon = statusGlyphicons[status];
    }

    this.currentGlyphicon = glyphicon;
  };

  onProjectEmailStatusChanges = (status: string): void => {
    if (status === "INVALID") {
      this.showEmailHelpBlock = true;
      this.emailFieldErrors = this.getErrorMessages("email");
    } else this.showEmailHelpBlock = false;
  };

  onSubmit(): void {
    console.log(this.projectForm);
  }

  getErrorMessages = (controlName: string): string[] => {
    const control = this.projectForm.get(controlName);

    if (!control.errors) return;

    const errorMessages: string[] = Object.keys(control.errors).map(
      (errKey) => {
        if (errKey === "required") return "The field is required";
        if (errKey === "forbiddenProjectName") return "Forbidden project name";
        if (errKey === "email") return "Invalid email";
        return "Invalid data";
      }
    );

    return errorMessages;
  };

  forbiddenProjectNameValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors => {
    const forbiddenList = ["Test"];
    const isForbidden = forbiddenList.includes(control.value);

    return isForbidden ? { forbiddenProjectName: true } : null;
  };

  forbiddenProjectNameAsyncValidator: AsyncValidatorFn = (
    control: AbstractControl
  ): Observable<ValidationErrors> => {
    return timer(1500).pipe(
      switchMap(() => {
        const forbiddenList = ["Test"];
        const isForbidden = forbiddenList.includes(control.value);

        const error = isForbidden ? { forbiddenProjectName: true } : null;
        return of(error);
      })
    );
  };
}
