import { NgModule }      				from '@angular/core';
import { RouterModule, Routes }			from '@angular/router';

import { AppComponent }   				from './components/app.component';
import { BetComponent }   				from './components/bet/bet.component';
import { NewBoardComponent } 			from './components/bet/newboard.component';

const appRoutes : Routes = [
	{ path : '', 		 component : BetComponent},
	{ path : 'board', 	 component : BetComponent},
	{ path : 'newboard', component : NewBoardComponent}
];

@NgModule({
  	imports:  [
		RouterModule.forRoot(appRoutes)
	],
    exports : [
        RouterModule
    ]
})

export class AppRouterModule {}
