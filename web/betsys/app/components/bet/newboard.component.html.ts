export const htmlTemplate = `
<body>
  <common-header>Loading...</common-header>

  <!--Body of page-->
  <div class="container newboard-container">
     <div [ngBusy]="config1"></div>
     <div [ngBusy]="config2"></div>
    
    <!-- Select Color Section -->
    <div class="bet-info-pane color-section-holder section-holder-common" >

          <div class="section-buttons-holder clear-both-common">
              <div class="right-float-common">
                <div class="left-float-common">
                  <div class="section-button left-float-common" 
                      *ngFor="let buttonMeta of pageMeta.colorSection.buttons"
                      (click)="colorSectionAction(buttonMeta.key)">          
                        {{buttonMeta.label}}
                  </div>              
                </div>
              </div>
          </div>
      
          <div class="new-board-subtitle-common clear-both-common">
            {{pageMeta.colorSection.title}}
          </div>
      
          <div class="new-board-subtitle-common clear-both-common" innerHTML = "{{pageMeta.colorSection.subtitle}}">
          </div>
      
          <div class="component-boxes-holder clear-both-common">
            <template let-component ngFor [ngForOf]="components">
              <div class="component-box-holder left-float-common"
                  *ngIf="component.sectionIndex === 0"
                  [style.backgroundColor]="component.bgColor"
                  [style.color]="component.textColor" 
                  (click)="openColorPicker(component, $event)" >           
                {{component.key}}
                <input class="color-input" type="color" value="{{component.bgColor}}" (change)="updateComponentStyles(component)" />
              </div>
            </template>
          </div>  
      
    </div>

    <!-- Drag Drop Section -->
    <div class="bet-info-pane color-section-holder section-holder-common" >

      <div class="section-buttons-holder clear-both-common">
              <div class="right-float-common">
                <div class="left-float-common">
                  <div class="section-button left-float-common" 
                      *ngFor="let buttonMeta of pageMeta.dragDropSection.buttons"
                      (click)="dragDropSectionAction(buttonMeta.key)">         
                        {{buttonMeta.label}}
                  </div>              
                </div>
              </div>
      </div>
      
      <div class="new-board-subtitle-common clear-both-common"  innerHTML = "{{pageMeta.dragDropSection.title}}">
      </div>
      
      <div class="component-boxes-holder clear-both-common">
        <template let-component ngFor [ngForOf]="components">
          <div class="component-box-holder left-float-common"  
              *ngIf="component.sectionIndex === 1"
              [style.backgroundColor]="component.bgColor"
              [style.color]="component.textColor"
              dnd-draggable 
              [dragData]="component" 
              [dragEnabled]="true">     
            <span>{{component.key}}</span>
            <span class="newboard-perfchart-icon" (click)="performanceChart(component.key)">
              <img alt="Performance Chart" class="chart-button-img" src="static/public/images/performance_button.png" />
            </span>
          </div>
        </template>
       </div>        
    </div>

    <!-- Blank board section -->
    <div class="bet-info-pane blank-board-section-holder  section-holder-common" >
        
        <div class="section-buttons-holder clear-both-common">
              <div class="right-float-common">
                <div class="left-float-common">
                  <div class="section-button left-float-common" 
                      *ngFor="let buttonMeta of pageMeta.blankBoardSection.buttons"
                       (click)="blankBoardAction(buttonMeta.key)" >           
                        {{buttonMeta.label}}
                  </div>              
                </div>
              </div>
        </div>

        <div class="blank-board-holder">
            <div class="bet-table-left-pane">
                <div class="bet-table-left-panel" 
                  [style.border-right-color] = "componentOff['bgColor']"
                  style="border-right: 66px solid;" >
                  <div class="bet-off-cls"
                    [style.color]="componentOff['textColor']" >
                      Off
                  </div>  
                </div>
            </div>
            <div class="bet-new-table-col-common bet-table-col{{col % 2}}" 
                  *ngFor="let col of cols; let idCol=index;">
            </div>

            <!--right pane 1-->
            <div class="bet-table-right-pane">
                <div class="pane-cell" title="{{item.orgText}}"  
                  *ngFor="let item of condCells['right1']; let id=index;" 
                  [style.background-color] = "item.bgColor"
                  (onDropSuccess)="droppedComponent($event, item)"
                  dnd-droppable >
                    <div class="pane-cell-caption" [style.color]="item.color">
                      <div 
                        style="display: table-cell; vertical-align: middle;"
                        [style.font-size.px] = "betCellCommonStyles.tsize"
                        [style.font-weight] = "betCellCommonStyles.tstyle"
                        [style.font-family] = "betCellCommonStyles.font">
                      {{item.text}}
                      </div>
                    </div>
                </div>  
            </div>

            <!--right pane 2-->
            <div class="bet-table-right-pane">
                <div class="pane-cell" title="{{item.orgText}}" 
                  *ngFor="let item of condCells['right2']; let id=index;" 
                  [style.background-color] = "item.bgColor"
                  (onDropSuccess)="droppedComponent($event, item)"
                  dnd-droppable >
                    <div class="pane-cell-caption" [style.color]="item.color">
                      <div 
                        style="display: table-cell; vertical-align: middle;"
                        [style.font-size.px] = "betCellCommonStyles.tsize"
                        [style.font-weight] = "betCellCommonStyles.tstyle"
                        [style.font-family] = "betCellCommonStyles.font">
                      {{item.text}}
                      </div>
                    </div>
                </div>
            </div>

            <!--Bottom Pane-->
            <div class="bet-table-bottom-section">
                <div class="bet-table-bottom-pane">
                  <div class="bottom-cell" title="{{item.orgText}}"
                    *ngFor="let item of condCells['bottom1']; let id=index;" 
                    [style.background-color] = "item.bgColor"
                    (onDropSuccess)="droppedComponent($event, item)"
                    dnd-droppable >
                      <div class="pane-cell-caption" [style.color]="item.color">
                        <div 
                          style="display: table-cell; vertical-align: middle;"
                          [style.font-size.px] = "betCellCommonStyles.tsize"
                          [style.font-weight] = "betCellCommonStyles.tstyle"
                          [style.font-family] = "betCellCommonStyles.font">
                        {{item.text}}
                        </div>
                      </div>
                  </div>
                 </div> 
            </div>

            <!--Bottom Pane 2 -->
            <div class="bet-risk">
              <div
                class="bet-risk-cell bet-risk-cell-{{id % 2}}" title="{{item.orgText}}"
                *ngFor="let item of condCells['bottom2']; let id=index;" 
                [style.backgroundColor] = "item.bgColor"
                (onDropSuccess)="droppedComponent($event, item)"
                dnd-droppable >
                <div class="risk-cell-caption" [style.color]="item.color">
                  <div 
                    style="display: table-cell; vertical-align: middle;"
                    [style.fontSize.px] = "betCellCommonStyles.tsize"
                    [style.fontWeight] = "betCellCommonStyles.tstyle"
                    [style.fontFamily] = "betCellCommonStyles.font"
                    >
                  {{item.text}}
                  </div>
                </div>
              </div>
            </div>  

        </div>      
    </div>
  </div>
  
  <!--alarm dialog for notify-->
  <modal #alarmModal data-toggle="modal" data-backdrop="static" data-keyboard="false">
    <modal-body style="text-align:center;">
      <div>
        {{alarmText}}
      </div>
    </modal-body>
    <modal-footer>
      <span class="btn btn-default" (click)="alarmModal.close();">{{alarmOKBtnText}}</span>
      <span class="btn btn-default"
            *ngIf="alarmRedirectBtnText !== ''" 
            (click)="redirectCallback();">{{alarmRedirectBtnText}}</span>
    </modal-footer>
  </modal>

  <!-- Performance Chart -->
  <div class="chart-pane"
      *ngIf="performanceChartMeta.isPerfChart"
      style="height: 700px;"
      [style.marginLeft.px] = "performanceChartMeta.marginLeft"
      [style.top]="performanceChartMeta.top + 'px'"
    >

    <div class="chart-pane-header" style="height: 90px;">
      <div class="chart-pane-header-top">
        <!--chart close button-->
        <div class="chart-close-btn" (click)="performanceChartMeta.isPerfChart = false;">
          <img src="static/public/images/button_close.png"
                    class="chart-button-img" alt="Performance Chart">
        </div>
        <!--chart title-->
        <div class="chart-title-text">{{performanceChartMeta.chartTitle}}</div>
      </div>

      <div class="chart-pane-header-bottom">
        <!--chart tab of chip image-->
        <div class="chart-pane-tab-bar">
          <div 
            class="chart-pane-tab" 
            [ngClass]="{'chart-pane-tab-on': performanceChartMeta.tabID === 1}"
            (click)="onTabItem(1)"
          >
            Info
          </div>
          <div 
            class="chart-pane-tab"
            *ngFor="let item of performanceChartMeta.dragAccounts; let idx = index;" 
            [ngClass]="{'chart-pane-tab-on': performanceChartMeta.tabID === idx + 2}"
            (click)="onTabItem(idx + 2)"
          >
            <div class="chart-aicon">
              <span class="chart-tab-icon-text">{{performanceChartMeta.dragAccounts[2-idx].text}}</span>
              <img 
                src="{{'static/public/images/' + performanceChartMeta.dragAccounts[2-idx].bg_url}}"
                class="chart-tab-icon"
              >
            </div>
          </div>
        </div>
      </div>

    </div>

    <div class="chart-pane-body" *ngIf="performanceChartMeta.tabID != 1">
      <div class="chart-pane-box">
        <div class="chart-pane-body-text"
            [style.color] = "performanceChartMeta.styles.color"
            [style.fontSize.px] = "performanceChartMeta.styles.size"
            [style.fontFamily] = "performanceChartMeta.styles.font"
            [style.fontWeight] = "performanceChartMeta.styles.style"
            innerHTML="{{performanceChartMeta.perText}}"
          >
        </div>
        <img class="chart-img" src="{{'/static/public/images/' + performanceChartMeta.perChartURL}}">
      </div>
      <div class="chart-pane-box">
      <div class="chart-pane-body-text"
          [style.color] = "performanceChartMeta.styles.color"
          [style.fontSize.px] = "performanceChartMeta.styles.size"
          [style.fontFamily] = "performanceChartMeta.styles.font"
          [style.fontWeight] = "performanceChartMeta.styles.style"
          innerHTML="{{performanceChartMeta.rankText}}"
        >
        </div>
        <img class="chart-img" src="{{'/static/public/images/' + performanceChartMeta.rankChartURL}}">
      </div>
    </div>

    <div class="chart-pane-body" *ngIf="performanceChartMeta.tabID == 1">
      <div class="chart-pane-box">
        <div class="chart-pane-body-text" style="padding-top: 0px;" 
            [style.color] = "performanceChartMeta.styles.color"
            [style.fontSize.px] = "performanceChartMeta.styles.size"
            [style.fontFamily] = "performanceChartMeta.styles.font"
            [style.fontWeight] = "performanceChartMeta.styles.style"
            innerHTML="{{performanceChartMeta.perText}}">
       </div>
        <div class="chart-pane-body-text"
            [style.color] = "performanceChartMeta.styles.color"
            [style.fontSize.px] = "performanceChartMeta.styles.size"
            [style.fontFamily] = "performanceChartMeta.styles.font"
            [style.fontWeight] = "performanceChartMeta.styles.style"
            innerHTML="{{performanceChartMeta.dateText}}">
        </div>
        <div class="chart-img"
            innerHTML="{{performanceChartMeta.signals}}"
            style="padding: 10px;"
          >
        </div>
      </div>
    </div>
  </div>
</body>
`;