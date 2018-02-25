import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { htmlTemplate } from './app.component.html';

@Component({
    // moduleId : module.id,
    selector: 'bet-app',
    template: htmlTemplate
})

export class AppComponent {
    constructor(
        private router:Router
    ){}
}
