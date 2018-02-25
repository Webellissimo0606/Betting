export const htmlTemplate = `
<body>

  <common-header>Loading...</common-header>

  <!--Body of page-->
  <div class="container">
    <div [ngBusy]="config1"></div>
    <div [ngBusy]="config2"></div>

    <!--information pane-->
    <div class="bet-info-pane">
      <table class="bet-info-table">
        <thead>
          <tr #bet_info_table_header_tr class="info-table-header">
            <td 
              style="width:18%; padding:4px;"
              [style.color]="tableStyles[1].color"
              [style.fontFamily]="tableStyles[1].font"
              [style.fontSize.px]="tableStyles[1].size"
              [style.fontWeight]="tableStyles[1].style"
            >
              Next Bet
            </td>
            <td
              style="width:19%; padding:4px;"
              [style.color]="tableStyles[1].color"
              [style.fontFamily]="tableStyles[1].font"
              [style.fontSize.px]="tableStyles[1].size"
              [style.fontWeight]="tableStyles[1].style"
            >
              Order Type
            </td>
            <td
              style="width:21%; min-width: 210px; padding:4px;"
              [style.color]="tableStyles[1].color"
              [style.fontFamily]="tableStyles[1].font"
              [style.fontSize.px]="tableStyles[1].size"
              [style.fontWeight]="tableStyles[1].style"
              >
              {{accountTableColumn1}}
            </td>
            <td
              style="width:19%; min-width: 250px; padding:4px;"
              [style.color]="tableStyles[1].color"
              [style.fontFamily]="tableStyles[1].font"
              [style.fontSize.px]="tableStyles[1].size"
              [style.fontWeight]="tableStyles[1].style"
            >
              {{accountTableColumn2}}
            </td>
            <td
              class="align-left" style="width:20%; padding:4px;"
              [style.color]="tableStyles[1].color"
              [style.fontFamily]="tableStyles[1].font"
              [style.fontSize.px]="tableStyles[1].size"
              [style.fontWeight]="tableStyles[1].style"
            >
              Last Update
            </td>
          </tr>
        </thead>
        <tbody>

          <!--for 50K account-->
          <tr #bet_info_table_tr 
              class="info-table-row"
              *ngFor="let account of dragAccounts; let idx=index;"
              >
            <!--for Next Bet-->
            <td>
              <div class="chip-avatar">
                <span class="chip-avatar-text">{{chipStyles[idx].text}}</span>
                <img src="{{'static/public/images/' + chipStyles[idx].img}}"
                     class="chip-img" alt="{{account.text}}">
              </div>
              <div 
                class="chip-text"
                [style.color]="tableStyles[0].color"
                [style.fontFamily]="tableStyles[0].font"
                [style.fontSize.px]="tableStyles[0].size"
                [style.fontWeight]="tableStyles[0].style"
              >
                  {{account.nextBet}}
              </div>
            </td>

            <!--for Order Type-->
            <td>
              <div class="chip-avatar">
                <span class="chip-avatar-text">{{chipStyles[idx].text}}</span>
                <img src="{{'static/public/images/' + chipStyles[idx].img}}"
                     class="chip-img" alt="{{account.text}}">
              </div>
              <div 
                class="chip-text"
                [style.color]="tableStyles[0].color"
                [style.fontFamily]="tableStyles[0].font"
                [style.fontSize.px]="tableStyles[0].size"
                [style.fontWeight]="tableStyles[0].style"
                >
                  {{account.orderType}}
              </div>
            </td>

            <!--for Today's Gain/Loss-->
            <td>
              <div class="chip-avatar">
                <span class="chip-avatar-text">{{chipStyles[idx].text}}</span>
                <img src="{{'static/public/images/' + chipStyles[idx].img}}"
                     class="chip-img" alt="{{account.text}}">
              </div>
              <div class="chip-button" (click)="performanceChart(0, idx)">
                <img src="static/public/images/performance_button.png"
                     class="chip-img" alt="{{account.text}}">
              </div>
              <div class="gradient">
                <div class="chip-text" style.color="{{account.column1Clr}}">{{account.column1}}</div>
              </div>
            </td>

            <!--for Account Value-->
            <td>
              <div class="chip-avatar">
                <span class="chip-avatar-text">{{chipStyles[idx].text}}</span>
                <img src="{{'static/public/images/' + chipStyles[idx].img}}"
                     class="chip-img" alt="{{account.text}}">
              </div>
              <div class="chip-button" (click)="performanceChart(2, idx)">
                <img src="static/public/images/performance_button.png"
                     class="chip-img" alt="{{account.text}}">
              </div>
              <div class="gradient">
                <div class="chip-text">{{account.column2}}</div>
              </div>
            </td>

            <!--for Last Update-->
            <td style="padding:0;">
              <div class="chip-text" style="font-size:12px;">{{account.lastUpdate}}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div #betbox class="betting-box">

      <!--time pane-->
      <div class="time-pane">
        <div
          class="time-text"
          style="width: 250px;"
          [style.color]="timeStyles[0].color"
          [style.fontFamily]="timeStyles[0].font"
          [style.fontSize.px]="timeStyles[0].size"
          [style.fontWeight]="timeStyles[0].style"
        >
          <div #curYearPane style="width:100px; float:left;">YYYY/mm/dd</div>
          <div #curTimePane style="width:90px; float:left;">HH:MM:SS</div>
          <div #timeZonePane style="width:50px; float:left;">EST</div>
        </div>

        <div style="float:right; width: 460px;">
          <div class="btn btn-clear"
            [style.color] = "buttonCells[0].color"
            [style.background-color] = "buttonCells[0].bgColor"
            [style.fontSize.px] = "buttonCells[0].tsize"
            [style.fontFamily] = "buttonCells[0].font"
            [style.fontWeight] = "buttonCells[0].tstyle"
            (click)="onReset()"
            >
              {{buttonCells[0].text}}
          </div>
          <div class="btn btn-clear"
            [style.color] = "buttonCells[1].color"
            [style.background-color] = "buttonCells[1].bgColor"
            [style.fontSize.px] = "buttonCells[1].tsize"
            [style.fontFamily] = "buttonCells[1].font"
            [style.fontWeight] = "buttonCells[1].tstyle"
            [routerLink]="['/newboard']"
            >
              {{buttonCells[1].text}}
          </div>
          <div class="btn btn-clear"
            [style.color] = "buttonCells[2].color"
            [style.background-color] = "buttonCells[2].bgColor"
            [style.fontSize.px] = "buttonCells[2].tsize"
            [style.fontFamily] = "buttonCells[2].font"
            [style.fontWeight] = "buttonCells[2].tstyle"
            (click)="onConfirmPOSTNative()"
            >
              {{buttonCells[2].text}}
          </div>
        </div>
      </div>

      <!--main pane-->
      <div class="betting-content">

        <!--control pane-->
        <div class="table-control-pane">
          <div class="immediate-orders-holder clear-both-common">
              <div class="immediate-orders-chip-button left-float-common" (click)="performanceChart(1, idx)">
                  <img class="chip-img" src="static/public/images/performance_button.png" />
              </div>
              <div class="immediate-orders-text left-float-common">{{chartInfo4.titleText}}</div>              
          </div>
          <div #nextTriggerTimePane 
            [style.color] = "timeStyles[1].color"
            [style.fontSize.px] = "timeStyles[1].size"
            [style.fontFamily] = "timeStyles[1].font"
            [style.fontWeight] = "timeStyles[1].style"
            class="trigger-pane"
          >
          </div>
        </div>

        <div
            class="bet-table-header-panel">
            <div
                class="bet-table-header-col{{(item + 1) % 2}}"
                [style.borderRadius] ="topBorderRadius(idx, 0) + 'px ' + topBorderRadius(idx ,1) + 'px 0 0'"
                [style.backgroundColor] = "condCells[0][(item + 1) % 2].bgColor"
                *ngFor="let item of cols; let idx=index;">
            </div>
        </div>
        <!--left Pane-->
        <div 
            class="bet-table-left-pane"
            [style.marginLeft.px] = "betMargins[3]"
        >
          <div #leftPane 
              class="bet-table-left-panel"
              [style.borderRight] = "'66px solid ' + offCell.bgColor"
            >

            <div 
                style="margin-right:5px; padding-top:145px; padding-left: 14px; margin-top: -62px;"
                [style.color] = "offCell.color"
                [style.fontFamily] = "offCell.style"
                [style.fontSize.px]="offCell.size"
                [style.fontWeight]="offCell.style"
              >
                {{offCell.text}}
            </div>

            <div
                  class="drag-item-container"
                  style="margin-left: 2px;"
                  dnd-droppable 
                  [dropZones]="['account-cell']"
                  (onDropSuccess)="onDropSuccess($event, -1, -1)"
                  >
              <div
                    class="drag-item panel panel-default" 
                    *ngFor="let account of dragAccounts; let idCol=index;"
                    >
                <div
                    class="account-item-body"
                    style="padding:0;"
                    [style.display]="account.display"
                    dnd-draggable 
                    [dragData]="account" 
                    [dragEnabled]="true"
                    ng-reflect-draggable="true"
                    [dropZones]="['drop-cell', 'cond-cell']"
                    [style.background-image]="'url(static/public/images/' + account.bg_url + ')'"
                    >
                  <span>{{account.text}}</span>
                </div>

              </div>
            </div>
                        
          </div>
        </div>
        
        <!--bet table-->
        <div 
            class="bet-table-col{{col % 2}}" 
            *ngFor="let col of cols; let idCol=index;"
            [style.background]="'transparent'"
            >
          
          <div #betCell class="bet-cell" id="betCell{{idCol}}{{idRow}}"
                [style.backgroundColor]="tableCells[idCol * 3 + (2-idRow)].bgColor"
                [style.color]="tableCells[idCol * 3 + (2-idRow)].color"
                [style.fontFamily]="tableCells[idCol * 3 + (2-idRow)].font"
                [style.fontSize]="tableCells[idCol * 3 + (2-idRow)].size"
                [style.fontWeight]="tableCells[idCol * 3 + (2-idRow)].style"
                (window:resize)="onResize($event, 0)" 
                *ngFor="let item of col_items; let idRow=index;" 
                dnd-droppable  
                (onDropSuccess)="onDropSuccess($event, idCol, idRow)" 
                [dropZones]="(tableCells[idCol * 3 + (2-idRow)].text !== '') ? ['drop-cell'] : ['']"
                >

            <div #betAcount
                 style="position:absolute; margin-top: 31px;"
                 [style.marginLeft.px] = "betMargins[0]"
                 *ngIf="betCells[idCol][idRow][0] != -1"
                  >
              <div
                  class="account-item-body"
                  style="padding:0; color:black;"
                  dnd-draggable 
                  [dragData]="cellInfo(idCol, idRow, 3, 0)" 
                  [dragEnabled]="true"
                  ng-reflect-draggable="true"
                  [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                  [style.background-image]="cellInfo(idCol, idRow, 0, 0)"
                  >
                <span>{{cellInfo(idCol, idRow, 1, 0)}}</span>
              </div>
            </div>

            <div #betAccount 
                 style="position:absolute; margin-top: 31px;"
                 [style.marginLeft.px] = "betMargins[0] + betCellWidths[0]"
                 *ngIf="betCells[idCol][idRow][1] != -1"
                  >
              <div
                  class="account-item-body"
                  style="padding:0; color:black;"
                  dnd-draggable 
                  [dragData]="cellInfo(idCol, idRow, 3, 1)" 
                  [dragEnabled]="true"
                  ng-reflect-draggable="true"
                  [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                  [style.background-image]="cellInfo(idCol, idRow, 0, 1)"
                  >
                <span>{{cellInfo(idCol, idRow, 1, 1)}}</span>
              </div>
            </div>

            <div #betAccount 
                 style="position:absolute; margin-top: 31px;"
                 [style.marginLeft.px] = "betMargins[0] + betCellWidths[0] * 2"
                 *ngIf="betCells[idCol][idRow][2] != -1"
                  >
              <div
                  class="account-item-body"
                  style="padding:0; color:black;"
                  dnd-draggable 
                  [dragData]="cellInfo(idCol, idRow, 3, 2)" 
                  [dragEnabled]="true"
                  ng-reflect-draggable="true"
                  [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                  [style.background-image]="cellInfo(idCol, idRow, 0, 2)"
                  >
                <span>{{cellInfo(idCol, idRow, 1, 2)}}</span>
              </div>
            </div>

            <div class="chart-button"
                (click)="performanceChart(3, (idCol + 1) * 3 - idRow)"
                [style.marginLeft.px] = "chartBTNMargins[0]"
                 *ngIf="tableCells[idCol * 3 + (2-idRow)].text !== ''"
              >
              <img src="static/public/images/performance_button.png"
                  class="chart-button-img" alt="Performance Chart">
            </div>

            <div class="bet-cell-caption">
              {{tableCells[idCol * 3 + (2-idRow)].text}}
            </div>

          </div>
        </div>

        <!--right pane 1-->
        <div #rightPane class="bet-table-right-pane">
          <div class="pane-cell" 
                (window:resize)="onResize($event, 1)" 
                *ngFor="let item of condCells[2]; let id=index;" 
                [style.background-color] = "item.bgColor"
                dnd-droppable  
                (onDropSuccess)="onDropSuccess($event, 14, id)" 
                [dropZones]="[cellInfo(14, id, 4, 0)]"
                >

            <div #betAcount
                  style="position:absolute; margin-top: 33px;"
                  [style.marginLeft.px] = "betMargins[1]"
                  *ngIf="condCells[2][id].dragItem[0] != -1"
                  >
              <div
                  class="account-item-body"
                  style="padding:0; color:black;"
                  dnd-draggable 
                  [dragData]="cellInfo(14, id, 3, 0)" 
                  [dragEnabled]="true"
                  ng-reflect-draggable="true"
                  [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                  [style.background-image]="cellInfo(14, id, 0, 0)"
                  >
                <span>{{cellInfo(14, id, 1, 0)}}</span>
              </div>
            </div>

            <div #betAccount 
                  style="position:absolute; margin-top: 33px;"
                  [style.marginLeft.px] = "betMargins[1] + betCellWidths[1]"
                  *ngIf="condCells[2][id].dragItem[1] != -1"
                  >
              <div
                  class="account-item-body"
                  style="padding:0; color:black;"
                  dnd-draggable 
                  [dragData]="cellInfo(14, id, 3, 1)" 
                  [dragEnabled]="true"
                  ng-reflect-draggable="true"
                  [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                  [style.background-image]="cellInfo(14, id, 0, 1)"
                  >
                <span>{{cellInfo(14, id, 1, 1)}}</span>
              </div>
            </div>

            <div #betAccount 
                  style="position:absolute; margin-top: 33px;"
                  [style.marginLeft.px] = "betMargins[1] + betCellWidths[1] * 2"
                  *ngIf="condCells[2][id].dragItem[2] != -1"
                  >
              <div
                  class="account-item-body"
                  style="padding:0; color:black;"
                  dnd-draggable 
                  [dragData]="cellInfo(14, id, 3, 2)" 
                  [dragEnabled]="true"
                  ng-reflect-draggable="true"
                  [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                  [style.background-image]="cellInfo(14, id, 0, 2)"
                  >
                <span>{{cellInfo(14, id, 1, 2)}}</span>
              </div>
            </div>

            <div class="chart-button"
                *ngIf="item.condID != -1"
                (click)="performanceChart(6, id)"
                [style.marginLeft.px] = "chartBTNMargins[1]"
              >
              <img src="static/public/images/performance_button.png"
                  class="chart-button-img" alt="Performance Chart">
            </div>

            <div 
                class="pane-cell-caption"
                [style.color]="item.color"
                >
                <div 
                    style="display: table-cell; vertical-align: middle;"
                    [style.font-size.px] = "item.tsize"
                    [style.font-weight] = "item.tstyle"
                    [style.font-family] = "item.font"
                    >
                  {{item.text}}
                </div>
            </div>
          </div>
        </div>

        <!--right pane 2-->
        <div class="bet-table-right-pane">
          <div  class="pane-cell" 
                (window:resize)="onResize($event)" 
                [style.backgroundColor] = "item.bgColor"
                *ngFor="let item of condCells[3]; let id=index;" 
                dnd-droppable  
                (onDropSuccess)="onDropSuccess($event, 15, id)" 
                [dropZones]="[cellInfo(15, id, 4, 0)]"
                >

            <div #betAcount
                  style="position:absolute; margin-top: 33px;"
                  [style.marginLeft.px] = "betMargins[1]"
                  *ngIf="condCells[3][id].dragItem[0] != -1"
                  >
              <div
                  class="account-item-body"
                  style="padding:0; color:black;"
                  dnd-draggable 
                  [dragData]="cellInfo(15, id, 3, 0)" 
                  [dragEnabled]="true"
                  ng-reflect-draggable="true"
                  [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                  [style.background-image]="cellInfo(15, id, 0, 0)"
                  >
                <span>{{cellInfo(15, id, 1, 0)}}</span>
              </div>
            </div>

            <div #betAccount 
                  style="position:absolute; margin-top: 33px;"
                  [style.marginLeft.px] = "betMargins[1] + betCellWidths[1]"
                  *ngIf="condCells[3][id].dragItem[1] != -1"
                  >
              <div
                  class="account-item-body"
                  style="padding:0; color:black;"
                  dnd-draggable 
                  [dragData]="cellInfo(15, id, 3, 1)" 
                  [dragEnabled]="true"
                  ng-reflect-draggable="true"
                  [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                  [style.background-image]="cellInfo(15, id, 0, 1)"
                  >
                <span>{{cellInfo(15, id, 1, 1)}}</span>
              </div>
            </div>

            <div #betAccount 
                  style="position:absolute; margin-top: 33px;"
                  [style.marginLeft.px] = "betMargins[1] + betCellWidths[1] * 2"
                  *ngIf="condCells[3][id].dragItem[2] != -1"
                  >
              <div
                  class="account-item-body"
                  style="padding:0; color:black;"
                  dnd-draggable 
                  [dragData]="cellInfo(15, id, 3, 2)" 
                  [dragEnabled]="true"
                  ng-reflect-draggable="true"
                  [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                  [style.background-image]="cellInfo(15, id, 0, 2)"
                  >
                <span>{{cellInfo(15, id, 1, 2)}}</span>
              </div>
            </div>

            <div class="chart-button"
                *ngIf="item.condID != -1"
                (click)="performanceChart(7, id)"
                [style.marginLeft.px] = "chartBTNMargins[1]"
              >
              <img src="static/public/images/performance_button.png"
                  class="chart-button-img" alt="Performance Chart">
            </div>

            <div 
                class="pane-cell-caption"
                [style.color]="item.color"
                >
                <div 
                    style="display: table-cell; vertical-align: middle;"
                    [style.fontSize.px] = "item.tsize"
                    [style.fontWeight] = "item.tstyle"
                    [style.fontFamily] = "item.font"
                    >
                  {{item.text}}
              </div>
            </div>
          </div>
        </div>

        <!--Bottom Pane-->
        <div #bottomPane class="bet-table-bottom-section">
          <div class="bet-table-bottom-pane">
            <div #bottomCell class="bottom-cell" 
                  (window:resize)="onResize($event)"
                  [style.backgroundColor] = "item.bgColor"
                  *ngFor="let item of condCells[1]; let id=index;" 
                  dnd-droppable 
                  (onDropSuccess)="onDropSuccess($event, 13, id)" 
                  [dropZones]="[cellInfo(13, id, 4, 0)]"
                  >


              <div #betAcount
                   style="position:absolute; margin-top: 31px;"
                   [style.marginLeft.px] = "betMargins[2]"
                   *ngIf="condCells[1][id].dragItem[0] != -1"
                    >
                <div
                    class="account-item-body"
                    style="padding:0; color:black;"
                    dnd-draggable 
                    [dragData]="cellInfo(13, id, 3, 0)" 
                    [dragEnabled]="true"
                    ng-reflect-draggable="true"
                    [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                    [style.background-image]="cellInfo(13, id, 0, 0)"
                    >
                  <span>{{cellInfo(13, id, 1, 0)}}</span>
                </div>
              </div>

              <div #betAccount 
                   style="position:absolute; margin-top: 31px;"
                   [style.marginLeft.px] = "betMargins[2] + betCellWidths[2]"
                   *ngIf="condCells[1][id].dragItem[1] != -1"
                    >
                <div
                    class="account-item-body"
                    style="padding:0; color:black;"
                    dnd-draggable 
                    [dragData]="cellInfo(13, id, 3, 1)" 
                    [dragEnabled]="true"
                    ng-reflect-draggable="true"
                    [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                    [style.background-image]="cellInfo(13, id, 0, 1)"
                    >
                  <span>{{cellInfo(13, id, 1, 1)}}</span>
                </div>
              </div>

              <div #betAccount 
                   style="position:absolute; margin-top: 31px;"
                   [style.marginLeft.px] = "betMargins[2] + betCellWidths[2] * 2"
                   *ngIf="condCells[1][id].dragItem[2] != -1"
                    >
                <div
                    class="account-item-body"
                    style="padding:0; color:black;"
                    dnd-draggable 
                    [dragData]="cellInfo(13, id, 3, 2)" 
                    [dragEnabled]="true"
                    ng-reflect-draggable="true"
                    [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                    [style.background-image]="cellInfo(13, id, 0, 2)"
                    >
                  <span>{{cellInfo(13, id, 1, 2)}}</span>
                </div>
              </div>

            <div class="chart-button"
                *ngIf="item.condID != -1"
                (click)="performanceChart(5, id)"
                [style.marginLeft.px] = "chartBTNMargins[2]"
              >
              <img src="static/public/images/performance_button.png"
                  class="chart-button-img" alt="Performance Chart">
            </div>

              <div 
                  class="pane-cell-caption"
                  [style.color]="item.color"
                  >
                <div 
                    style="display: table-cell; vertical-align: middle;"
                    [style.fontSize.px] = "item.tsize"
                    [style.fontWeight] = "item.tstyle"
                    [style.fontFamily] = "item.font"
                    >
                  {{item.text}}
                </div>
              </div>
            </div>
          </div>

          <!--logo image-->
          <div style="width: 9%; float:right; margin-right: 4%; margin-top: 10px; margin-bottom: 40px;">
            <img style="width:100%;" src="/static/public/images/logo.png">
          </div>

        </div>


        <!--pane for risk-->
        <div class="bet-risk">
          <div
              class="bet-risk-cell-{{id % 2}}"
              *ngFor="let item of condCells[0]; let id=index;" 
              [style.backgroundColor] = "item.bgColor"
              dnd-droppable 
              (onDropSuccess)="onDropSuccess($event, 12, id)" 
              [dropZones]="[cellInfo(12, id, 4, 0)]"
              [ngClass]="{'empty-risk-cell': item.condID === -1}"
              >

              <div #betAcount
                   style="position:absolute; margin-top: 31px;"
                   [style.marginLeft.px] = "betMargins[2]"
                    *ngIf="condCells[0][id].dragItem[0] != -1"
                    >
                <div
                    class="account-item-body"
                    style="padding:0; color:black;"
                    dnd-draggable 
                    [dragData]="cellInfo(12, id, 3, 0)" 
                    [dragEnabled]="true"
                    ng-reflect-draggable="true"
                    [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                    [style.background-image]="cellInfo(12, id, 0, 0)"
                    >
                  <span>{{cellInfo(12, id, 1, 0)}}</span>
                </div>
              </div>

              <div #betAccount 
                   style="position:absolute; margin-top: 31px;"
                   [style.marginLeft.px] = "betMargins[2] + betCellWidths[2]"
                   *ngIf="condCells[0][id].dragItem[1] != -1"
                    >
                <div
                    class="account-item-body"
                    style="padding:0; color:black;"
                    dnd-draggable 
                    [dragData]="cellInfo(12, id, 3, 1)" 
                    [dragEnabled]="true"
                    ng-reflect-draggable="true"
                    [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                    [style.background-image]="cellInfo(12, id, 0, 1)"
                    >
                  <span>{{cellInfo(12, id, 1, 1)}}</span>
                </div>
              </div>

              <div #betAccount 
                   style="position:absolute; margin-top: 31px;"
                   [style.marginLeft.px] = "betMargins[2] + betCellWidths[2] * 2"
                   *ngIf="condCells[0][id].dragItem[2] != -1"
                    >
                <div
                    class="account-item-body"
                    style="padding:0; color:black;"
                    dnd-draggable 
                    [dragData]="cellInfo(12, id, 3, 2)" 
                    [dragEnabled]="true"
                    ng-reflect-draggable="true"
                    [dropZones]="['drop-cell', 'cond-cell','account-cell']"
                    [style.background-image]="cellInfo(12, id, 0, 2)"
                    >
                  <span>{{cellInfo(12, id, 1, 2)}}</span>
                </div>
              </div>

            <div class="chart-button"
                *ngIf="item.condID != -1"
                (click)="performanceChart(4, id)"
                [style.marginLeft.px] = "chartBTNMargins[2]"
              >
              <img src="static/public/images/performance_button.png"
                  class="chart-button-img" alt="Performance Chart">
            </div>

              <div class="risk-cell-caption">
                <div 
                    style="display: table-cell; vertical-align: middle;"
                    [style.fontSize.px] = "item.tsize"
                    [style.fontWeight] = "item.tstyle"
                    [style.fontFamily] = "item.font"
                    >
                  {{condCells[0][id].text}}
                </div>
              </div>

          </div>
        </div>

        <!--for condition rearray panel-->
        <div class="bet-cond-pane" style="display:none">
          Cond Panel
        </div>
        
        <!--for recent data-->
        <div 
            class="bet-recent-pane" 
            *ngIf="bShowRecentData"
          >
          <div style="padding: 8px; font-size: 18px;"><b>History</b></div>
          <div style="width: 100%; height: 82%; overflow-y: scroll; padding: 1px; box-shadow: 0 0 6px 1px #444343;">
            <table class="bet-recent-table">
              <thead>
                <tr #bet_recent_table_header_tr class="recent-table-header">
                  <th style="width:15%; padding:4px;">Timestamp</th>
                  <th style="width:10%; padding:4px;">MC Date</th>
                  <template let-header ngFor [ngForOf]="recentDataDynamicHeaders">
                    <th style="width:{{dynamicColumnWidth}}%; padding:4px;" 
                        *ngFor="let item of header.items; let idx=index;"
                        [ngClass]="{'bet-column-highlight': idx === 0}" 
                      >
                        {{item}}
                    </th>
                  </template>
                </tr>
              </thead>

              <tbody>

                <tr #bet_recent_table_tr 
                    class="recent-table-row"
                    *ngFor="let data of recentData; let idx = index;"
                    >
                  <td style="text-align: left;">
                    <div class="recent-text">{{data.timestamp}}</div>
                  </td>

                  <td>
                    <div class="recent-text">{{data.mcdate}}</div>
                  </td>

                  <template let-selection ngFor [ngForOf]="data.selection">
                    <td style="padding:0;" 
                      *ngFor="let item of selection.items; let idx=index;"
                      [ngClass]="{'bet-column-highlight': idx === 0}"  
                      >
                      <div class="recent-text">{{item}}</div>
                    </td>  
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!--bet box footer-->
      <div class="bet-footer-pane">
      </div>

    </div>

    <!--test panel-->
    <div class="test-panel" style="display:none">
      <div class="test-panel1">
        {{test_value1}}
      </div>
      <div class="test-panel2">
        {{test_value2}}
      </div>
    </div>

  </div>
</body>

<!--confirm dialog for anti / normal && time-->
<modal #cfgModalVote data-toggle="modal" data-backdrop="static" data-keyboard="false">
  <modal-body style="text-align:center;">
    <div style="text-align: left; width: 100%; font-weight: bold; font-size: 24px;">Bet</div>
    <div style="border:1px dashed #8030F8; margin-bottom: 15px;">
      <span 
          class="btn" style="border: 1px solid #A0A0A0; margin: 10px; border-radius: 15px;"
          [style.background-color] = "cfgModalTextStyle(0, 0, 0)"
          [style.fontSize.px] = "cfgModalTextStyle(0, 0, 1)"
          [style.fontFamily] = "cfgModalTextStyle(0, 0, 2)"
          [style.fontWeight] = "cfgModalTextStyle(0, 0, 3)"
          (click)="voteType = 0;"
        >
        {{voteText}}
      </span>
      <span 
          class="btn" style="border: 1px solid #A0A0A0; margin: 10px; border-radius: 15px;" 
          [style.background-color] = "cfgModalTextStyle(0, 1, 0)"
          [style.fontSize.px] = "cfgModalTextStyle(0, 1, 1)"
          [style.fontFamily] = "cfgModalTextStyle(0, 1, 2)"
          [style.fontWeight] = "cfgModalTextStyle(0, 1, 3)"
          (click)="voteType = 1;" *ngIf="antiOpt"
        >
        {{antiVoteText}}
      </span>
    </div>
    <div style="text-align: left; width: 100%; font-weight: bold; font-size: 24px;">Order Type</div>
    <div style="border:1px dashed #8030F8;" *ngIf="curDragIdx != -1">
      <span 
          class="btn" style="border: 1px solid #A0A0A0; margin: 10px; border-radius: 15px;" 
          [style.background-color] = "cfgModalTextStyle(1, 0, 0)"
          [style.fontSize.px] = "cfgModalTextStyle(1, 0, 1)"
          [style.fontFamily] = "cfgModalTextStyle(1, 0, 2)"
          [style.fontWeight] = "cfgModalTextStyle(1, 0, 3)"
          (click)="entryType = 0;"
        >
        {{dragAccounts[curDragIdx].orderType}}
      </span>
      <span 
          class="btn" style="border: 1px solid #A0A0A0; margin: 10px; border-radius: 15px;" 
          [style.background-color] = "cfgModalTextStyle(1, 1, 0)"
          [style.fontSize.px] = "cfgModalTextStyle(1, 1, 1)"
          [style.fontFamily] = "cfgModalTextStyle(1, 1, 2)"
          [style.fontWeight] = "cfgModalTextStyle(1, 1, 3)"
          (click)="entryType = 1;"
        >
        Immediate
      </span>
      <div style="margin-top: 5px; margin-left: 10px; text-align: left;">
        <p
          innerHTML="{{dlgStyles[6].text}}"
          [style.background-color] = "dlgStyles[6].bgColor"
          [style.fontSize.px] = "dlgStyles[6].size"
          [style.fontFamily] = "dlgStyles[6].font"
          [style.fontWeight] = "dlgStyles[6].style"
        >
        </p>
      </div>
    </div>
  </modal-body>
  <modal-footer>
    <span
      class="btn btn-clear"
      style="border-radius: 15px;"
      [style.color] = "dlgStyles[0].color"
      [style.background-color] = "dlgStyles[0].bgColor"
      [style.fontSize.px] = "dlgStyles[0].size"
      [style.fontFamily] = "dlgStyles[0].font"
      [style.fontWeight] = "dlgStyles[0].style"
      (click)="onOKVote(); cfgModalVote.close(); voteType = 0; entryType = 0;"
    >
      {{dlgStyles[0].text}}
    </span>
    <span
      class="btn btn-clear"
      style="border-radius: 15px;"
      [style.color] = "dlgStyles[1].color"
      [style.background-color] = "dlgStyles[1].bgColor"
      [style.fontSize.px] = "dlgStyles[1].size"
      [style.fontFamily] = "dlgStyles[1].font"
      [style.fontWeight] = "dlgStyles[1].style"
      (click)="onCancelVote(); cfgModalVote.close(); voteType = 0; entryType = 0;"
    >
      {{dlgStyles[1].text}}
    </span>
  </modal-footer>
</modal>

<!--confirm dialog for off pane-->
<modal #cfgModalOff data-toggle="modal" data-backdrop="static" data-keyboard="false">
  <modal-body style="text-align:center;">
    <div style="text-align: left; width: 100%; font-weight: bold; font-size: 24px;">Order Type</div>
    <div style="border:1px dashed #8030F8;">
      <span 
          class="btn" style="border: 1px solid #A0A0A0; margin: 10px; border-radius: 15px;" 
          [style.background-color] = "cfgModalTextStyle(1, 0, 0)"
          [style.fontSize.px] = "cfgModalTextStyle(1, 0, 1)"
          [style.fontFamily] = "cfgModalTextStyle(1, 0, 2)"
          [style.fontWeight] = "cfgModalTextStyle(1, 0, 3)"
          (click)="entryType = 0;"
        >
        {{dragAccounts[curDragIdx].orderType}}
      </span>
      <span 
          class="btn" style="border: 1px solid #A0A0A0; margin: 10px; border-radius: 15px;" 
          [style.background-color] = "cfgModalTextStyle(1, 1, 0)"
          [style.fontSize.px] = "cfgModalTextStyle(1, 1, 1)"
          [style.fontFamily] = "cfgModalTextStyle(1, 1, 2)"
          [style.fontWeight] = "cfgModalTextStyle(1, 1, 3)"
          (click)="entryType = 1;"
        >
        Immediate
      </span>
      <!--<span class="btn" style="border: 1px solid #A0A0A0; margin: 10px;" [style.text-shadow]="cfgModalTextStyle(1, 0)" (click)="entryType = 0;">{{curTimeWithType(0)}}</span>
      <span class="btn" style="border: 1px solid #A0A0A0; margin: 10px;" [style.text-shadow]="cfgModalTextStyle(1, 1)" (click)="entryType = 1;">Immediate</span>-->
    </div>
  </modal-body>
  <modal-footer>
    <span
      class="btn btn-clear"
      style="border-radius: 15px;"
      [style.color] = "dlgStyles[0].color"
      [style.background-color] = "dlgStyles[0].bgColor"
      [style.fontSize.px] = "dlgStyles[0].size"
      [style.fontFamily] = "dlgStyles[0].font"
      [style.fontWeight] = "dlgStyles[0].style"
      (click)="onOKVote(); cfgModalOff.close(); entryType = 0;"
    >
      {{dlgStyles[0].text}}
    </span>
    <span
      class="btn btn-clear"
      style="border-radius: 15px;"
      [style.color] = "dlgStyles[1].color"
      [style.background-color] = "dlgStyles[1].bgColor"
      [style.fontSize.px] = "dlgStyles[1].size"
      [style.fontFamily] = "dlgStyles[1].font"
      [style.fontWeight] = "dlgStyles[1].style"
      (click)="onCancelVote(); cfgModalOff.close();  entryType = 0;"
    >
      {{dlgStyles[1].text}}
    </span>
  </modal-footer>
</modal>

<!--alarm dialog for notify-->
<modal #alarmModal data-toggle="modal" data-backdrop="static" data-keyboard="false">
  <modal-body style="text-align:center;">
    <div>
      {{alarmText}}
    </div>
  </modal-body>
  <modal-footer>
    <span class="btn btn-default" (click)="alarmModal.close();">{{alarmOKBtnText}}</span>
  </modal-footer>
</modal>

<!--confirm dialog for asking-->
<modal #confirmModal data-toggle="modal" data-backdrop="static" data-keyboard="false">
  <modal-body style="text-align:center;">
    <div
      innerHTML = "{{dlgStyles[7].text}}"
      [style.color] = "dlgStyles[7].color"
      [style.background-color] = "dlgStyles[7].bgColor"
      [style.fontSize.px] = "dlgStyles[7].size"
      [style.fontFamily] = "dlgStyles[7].font"
      [style.fontWeight] = "dlgStyles[7].style"
    >
    </div>
  </modal-body>
  <modal-footer>
    <span
        class="btn btn-clear"
        style="border-radius: 15px;"
        [style.color] = "dlgStyles[4].color"
        [style.background-color] = "dlgStyles[4].bgColor"
        [style.fontSize.px] = "dlgStyles[4].size"
        [style.fontFamily] = "dlgStyles[4].font"
        [style.fontWeight] = "dlgStyles[4].style"
        (click)="agreeOnConfirm(); confirmModal.close();"
      >
      {{dlgStyles[4].text}}
    </span>
    <span
        class="btn btn-clear"
        style="border-radius: 15px;"
        [style.color] = "dlgStyles[5].color"
        [style.background-color] = "dlgStyles[5].bgColor"
        [style.fontSize.px] = "dlgStyles[5].size"
        [style.fontFamily] = "dlgStyles[5].font"
        [style.fontWeight] = "dlgStyles[5].style"
        (click)="confirmModal.close();"
      >
      {{dlgStyles[5].text}}
    </span>
  </modal-footer>
</modal>



<!--Chart dialog of Account Value-->
<div class="chart-pane" 
    *ngIf="isChartBox1" 
    [style.marginLeft.px] = "chartInfo1[0].marginLeft"
    [style.top]="chartInfo1[0].top + 'px'"
  >
  <div class="chart-pane-header">
    <!--chart icon of chip image-->
    <div class="chart-icon">
      <span class="chart-icon-text">{{chartInfo1[0].chipText}}</span>
      <img src="{{'static/public/images/' + chartInfo1[0].chipImg}}"
              class="chart-icon" alt="{{chartInfo1[0].chipText}}">
    </div>
    <!--chart close button-->
    <div class="chart-close-btn" (click)="isChartBox1 = false;">      
      <!--<span class="chart-close-text">{{chartInfo1[0].chipText}}</span>
      <img src="{{'static/public/images/' + chartInfo1[0].chipImg}}"
              class="chart-icon" alt="{{chartInfo1[0].chipText}}">-->
      <img src="static/public/images/button_close.png"
                  class="chart-button-img">
    </div>
    <!--chart title-->
    <div class="chart-title-text">{{chartInfo1[0].chartTitle}}</div>
  </div>
  <div class="chart-pane-body">
    <div class="chart-pane-body-text"
        [style.color] = "chartStyle[0].color"
        [style.background-color] = "chartStyle[0].bgColor"
        [style.fontSize.px] = "chartStyle[0].size"
        [style.fontFamily] = "chartStyle[0].font"
        [style.fontWeight] = "chartStyle[0].style"
        innerHTML="{{chartInfo1[0].bodyText}}"
      >
    </div>
    <img class="chart-img" src="{{'/static/public/images/' + chartInfo1[0].chartURL}}">
  </div>
</div>



<!--Chart dialog of Bet Value-->
<div class="chart-pane"
    *ngIf="isChartBox2"
    style="height: 700px;"
    [style.marginLeft.px] = "chartInfo1[0].marginLeft"
    [style.top]="chartInfo2[0].top + 'px'"
  >

  <div class="chart-pane-header" style="height: 90px;">
    <div class="chart-pane-header-top">
      <!--chart close button-->
      <div class="chart-close-btn" (click)="isChartBox2 = false;">
        <img src="static/public/images/button_close.png"
                  class="chart-button-img" alt="Performance Chart">
      </div>
      <!--chart title-->
      <div class="chart-title-text">{{chartInfo2[0].chartTitle}}</div>
    </div>

    <div class="chart-pane-header-bottom">
      <!--chart tab of chip image-->
      <div class="chart-pane-tab-bar">
        <div 
          class="chart-pane-tab" 
          [ngClass]="{'chart-pane-tab-on': tabID === 1}"
          (click)="onTabItem(1)"
        >
          Info
        </div>
        <div 
          class="chart-pane-tab"
          *ngFor="let item of dragAccounts; let idx = index;" 
          [ngClass]="{'chart-pane-tab-on': tabID === idx + 2}"
          (click)="onTabItem(idx + 2)"
        >
          <div class="chart-aicon">
            <span class="chart-tab-icon-text">{{dragAccounts[2-idx].text}}</span>
            <img 
              src="{{'static/public/images/' + dragAccounts[2-idx].bg_url}}"
              class="chart-tab-icon"
            >
          </div>
        </div>
      </div>
    </div>

  </div>

  <div class="chart-pane-body" *ngIf="tabID != 1">
    <div class="chart-pane-box">
      <div class="chart-pane-body-text"
          [style.color] = "chartStyle[0].color"
          [style.background-color] = "chartStyle[0].bgColor"
          [style.fontSize.px] = "chartStyle[0].size"
          [style.fontFamily] = "chartStyle[0].font"
          [style.fontWeight] = "chartStyle[0].style"
          innerHTML="{{chartInfo2[0].perText}}"
        >
      </div>
      <img class="chart-img" src="{{'/static/public/images/' + chartInfo2[0].perChartURL}}">
    </div>
    <div class="chart-pane-box">
    <div class="chart-pane-body-text"
        [style.color] = "chartStyle[0].color"
        [style.background-color] = "chartStyle[0].bgColor"
        [style.fontSize.px] = "chartStyle[0].size"
        [style.fontFamily] = "chartStyle[0].font"
        [style.fontWeight] = "chartStyle[0].style"
        innerHTML="{{chartInfo2[0].rankText}}"
      >
      </div>
      <img class="chart-img" src="{{'/static/public/images/' + chartInfo2[0].rankChartURL}}">
    </div>
  </div>

  <div class="chart-pane-body" *ngIf="tabID == 1">
    <div class="chart-pane-box">
      <div class="chart-pane-body-text" style="padding-top: 0px;" 
            [style.color] = "chartStyle[0].color"
            [style.fontSize.px] = "chartStyle[0].size"
            [style.fontFamily] = "chartStyle[0].font"
            [style.fontWeight] = "chartStyle[0].style"
            innerHTML="{{chartInfo2[0].perText}}">
      </div>
      <div class="chart-pane-body-text"
          [style.color] = "chartStyle[0].color"
          [style.fontSize.px] = "chartStyle[0].size"
          [style.fontFamily] = "chartStyle[0].font"
          [style.fontWeight] = "chartStyle[0].style"
          innerHTML="{{chartInfo2[0].dateText}}">
      </div>
      <div class="chart-img"
          innerHTML="{{chartInfo2[0].signals}}"
          style="padding: 10px;"
        >
      </div>
    </div>
  </div>
</div>  

 <!-- Chart dialogue of pnl -->
<div class="chart-pane"
    *ngIf="isChartBox3"
    style="height: 700px;"
    [style.marginLeft.px] = "chartInfo1[0].marginLeft"
    [style.top]="chartInfo2[0].top + 'px'"
  >

  <div class="chart-pane-header" style="height: 90px;">
    <div class="chart-aicon left-float-common">
          <span class="chart-tab-icon-text">{{dragAccounts[chartInfo3.subType].text}}</span>
          <img 
            src="{{'static/public/images/' + dragAccounts[chartInfo3.subType].bg_url}}"
            class="chart-tab-icon"
          />
    </div>
    <div class="chart-pane-header-top">
      <!--chart close button-->
      <div class="chart-close-btn" (click)="isChartBox3 = false;">
        <img src="static/public/images/button_close.png"
                  class="chart-button-img" alt="PNL Chart">
      </div>
      <!--chart title-->
      <div class="chart-title-text">{{chartInfo3.chartTitle}}</div>
    </div>

    <div class="chart-pane-header-bottom">
      <!--chart tab of chip image-->
      <div class="chart-pane-tab-bar">
        <div 
          class="chart-pane-tab"
          *ngFor="let item of chartInfo3.tabsList; let idx=index;"
          [ngClass]="{'chart-pane-tab-on': chartInfo3.tabID === idx}"
          (click)="handlePNLTabs(idx, '')"
        >
          {{chartInfo3.tabsList[idx].name}}
        </div>
      </div>
    </div>

  </div>

  <div class="chart-pane-body">
    <div class="chart-pane-box">
      <div class="chart-pane-body-text"
          [style.color] = "chartStyle[0].color"
          [style.background-color] = "chartStyle[0].bgColor"
          [style.fontSize.px] = "chartStyle[0].size"
          [style.fontFamily] = "chartStyle[0].font"
          [style.fontWeight] = "chartStyle[0].style"
          innerHTML="{{chartInfo3.tabBody.text}}"
        >
      </div>
    </div>
    <div class="chart-img"
          innerHTML="{{chartInfo3.tabBody.html}}"
        >
    </div>
  </div>
</div>  

  <!-- Chart dialogue of immediate orders -->
<div class="chart-pane"
    *ngIf="isChartBox4"
    style="height: 700px;"
    [style.marginLeft.px] = "chartInfo1[0].marginLeft"
    [style.top]="chartInfo2[0].top + 'px'"
  >

  <div class="chart-pane-header" style="height: 90px;">
    <div class="chart-pane-header-top">
      <!--chart close button-->
      <div class="chart-close-btn" (click)="isChartBox4 = false;">
        <img src="static/public/images/button_close.png"
                  class="chart-button-img" alt="Immediate Orders Chart">
      </div>
      <!--chart title-->
      <div class="chart-title-text">{{chartInfo4.chartTitle}}</div>
    </div>

    <div class="chart-pane-header-bottom">
      <!--chart tab of chip image-->
      <div class="chart-pane-tab-bar">
        <div 
          class="chart-pane-tab" 
          [ngClass]="{'chart-pane-tab-on': chartInfo4.tabID === 0}"
          (click)="handleImmediateOrderTabs(0)"
        >
          Info
        </div>
        <div 
          class="chart-pane-tab"
          *ngFor="let item of dragAccounts; let idx=index;"
          [ngClass]="{'chart-pane-tab-on': chartInfo4.tabID === idx + 1}"
          (click)="handleImmediateOrderTabs(idx + 1)"
        >
          <div class="chart-aicon">
            <span class="chart-tab-icon-text">{{dragAccounts[2-idx].text}}</span>
            <img 
              src="{{'static/public/images/' + dragAccounts[2-idx].bg_url}}"
              class="chart-tab-icon"
            >
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="chart-pane-body">
    <div class="chart-pane-box">
        <div class="chart-pane-body-text"
            [style.color] = "chartStyle[0].color"
            [style.background-color] = "chartStyle[0].bgColor"
            [style.fontSize.px] = "chartStyle[0].size"
            [style.fontFamily] = "chartStyle[0].font"
            [style.fontWeight] = "chartStyle[0].style"
            innerHTML="{{chartInfo4.tabBody.text}}"
          >
        </div>
    </div>
    <div class="chart-img"
        innerHTML="{{chartInfo4.tabBody.html}}"
      >
    </div>
  </div>
</div>
`;