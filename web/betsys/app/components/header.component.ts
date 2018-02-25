import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { htmlTemplate } from './header.component.html';

@Component({
    selector: 'common-header',
    template: htmlTemplate
})

export class HeaderComponent {
	
	// User information..
    user = {
        name : "Hidemi Asakura",
        avatarURL : "/static/public/images/avatar.png",
        version : "0.0.5.3",
    };

    constructor(
        private router:Router
    ){}
}
