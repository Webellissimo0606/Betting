import { Component, ElementRef, ViewChild } from '@angular/core';
import { NgStyle } from '@angular/common'
import { Router } from '@angular/router';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { htmlTemplate } from './newboard.component.html';
import { BetService, BetXHRService } 	from 'app/services/bet.service';

import { ListToObjectTransform, ObjectToArrayTransform, 
         ReturnTextColorRelativeToBackground, ArrayShuffle }  from 'app/pipes/bet.pipes';
 
@Component({
    selector : 'relative-path',
    template : htmlTemplate
})

export class NewBoardComponent implements OnInit {
	
    	components = [];
      componentsLen = 0;
      componentsAssoc = {
      };
      componentLoc = [];


      db_Selection = {
        "v4micro" : ["Off", "False"],
        "v4mini" : ["Off", "False"],
        "v4futures" : ["Off", "False"]
      };

      baseURL = "";
      
      busyA: Promise<any>;
      busyB: Promise<any>;
      busyC: Promise<any>; 

      componentOff = {
        'bgColor': '#FFFFFF',
        'textColor': '#000000'
      };

      recordsMeta = {};
      stylesMeta = {};

      // For bet box..
      cols = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];

      betCellCommonStyles = {
        tsize: 24,
        tstyle: "bold",
        font: "Book Antigua"
      };

      // Row condition 1..
      condCells = {
          "bottom2": [
              {color:"#000000", bgColor:"#FFFFFF", condID:1, text:"", orgText:""},
              {color:"#000000", bgColor:"#FFFFFF", condID:2, text:"", orgText:""}
          ],
          "bottom1": [
              {color:"#000000", bgColor:"#FFFFFF", condID:3, text:"", orgText:""},
              {color:"#000000", bgColor:"#FFFFFF", condID:4, text:"", orgText:""},
              {color:"#000000", bgColor:"#FFFFFF", condID:5, text:"", orgText:""},
              {color:"#000000", bgColor:"#FFFFFF", condID:6, text:"", orgText:""},
              {color:"#000000", bgColor:"#FFFFFF", condID:7, text:"", orgText:""},
              {color:"#000000", bgColor:"#FFFFFF", condID:8, text:"", orgText:""}
          ],
          "right1": [
              {color:"#000000", bgColor:"#FFFFFF", condID:9, text:"", orgText:""},
              {color:"#000000", bgColor:"#FFFFFF", condID:11, text:"", orgText:""},
              {color:"#000000", bgColor:"#FFFFFF", condID:13, text:"", orgText:""}           
          ],
          "right2": [
              {color:"#000000", bgColor:"#FFFFFF", condID:10, text:"", orgText:""},
              {color:"#000000", bgColor:"#FFFFFF", condID:12, text:"", orgText:""},
              {color:"#000000", bgColor:"#FFFFFF", condID:14, text:"", orgText:""}
          ]
      };

      // Component dictionary features..
      componentDict = [
          {webText:"LowestEquity"},
          {webText:"AntiLowestEquity"},
          {webText:"HighestEquity"},
          {webText:"AntiHighestEquity"},
          {webText:"Previous"},
          {webText:"Anti-Previous"},
          {webText:"50/50"},
          {webText:"Anti50/50"},
          {webText:"Seasonality"},
          {webText:"Anti-Seasonality"},
          {webText:"Custom"},
          {webText:"Anti-Custom"},
          {webText:"RiskOn"},
          {webText:"RiskOff"}
      ];

      selectedComponentInput : any;

      listToObjectPipe = new ListToObjectTransform();
      objectToArrayPipe = new ObjectToArrayTransform();
      returnTextColorRelativeToBackground = new ReturnTextColorRelativeToBackground(); 
      arrayShuffle = new ArrayShuffle();

      config1 = {
        'busy': '',
        'message': ''
      };

      config2 = {
        'busy': '',
        'message': ''
      };

    	pageMeta = {
        "cNone": {},
        
        "pageSectionBackground": "",
        
        "colorDefaults": ['#BE0032', '#222222', '#4FF773', '#FFFF00', '#A1CAF1', '#C2B280',
                          '#E68FAC', '#F99379', '#F38400', '#848482', '#008856', '#0067A5', '#604E97',
                          '#B3446C', '#654522', '#EA2819'],

        "loading_message": "Please wait 10-15 minutes for the charts to be recreated.",

        "loadingMessages": [{
                      'newboard': 'Please wait 10-15 minutes for the charts to be recreated.'    
                  }, {
                      'immediate': 'Please wait up to five minutes for immediate orders to be processed.'    
                  }, {
                      'else': 'Please wait up for the board to load.'    
                  }],
    		
        "colorSection": {
                          "title": "Create New Custom Board:",

    		                  "subtitle": "Click on the component box to choose the colors for the components you want to use. Once you are done click the save button. If you do not want to choose custom colors, click Auto-Select and save.",
                          
                          "buttons": [{
                                  "key": "auto-select",
                                  "label": "Auto-Select"
                                }, {
                                  "key": "reset",
                                  "label": "Reset"    
                                }, {
                                  "key": "save",
                                  "label": "Save"
                          }],

                          "errorText": ""
                        },
          
        "dragDropSection": {
                          "title": "Drag and drop components to blank boxes below. You may leave boxes blank.",

                          "subtitle": "",

                           "buttons": [{
                                  "key": "reset",
                                  "label": "Reset"
                                }],

                            "errorText": ""
                        },
           "blankBoardSection": {
                          "title": "",
                          
                          "subtitle": "",

                          "buttons": [{
                                  "key": "reset",
                                  "label": "Reset"
                                }, {
                                  "key": "save",
                                  "label": "Save"
                            }],

                           "errorText": "" 
           }                                   
    	};

      componentShorthands = {
        'Off' : 'Off',
        'RiskOn': 'RON',
        'RiskOff': 'ROFF',
        'LowestEquity': 'LE',
        'HighestEquity': 'HE',
        'AntiHighestEquity': 'AHE',
        'AntiLowestEquity': 'ALE',
        'Anti50/50': 'A50',
        'Seasonality': 'SEA',
        'Anti-Seasonality': 'ASEA',
        'Previous': 'PREV',
        'Anti-Previous': 'AP',
        'Custom': 'Custom',
        'Anti-Custom': 'AC',
        '50/50': '50/50'
      };

      performanceChartMeta = {
        top: 400, 
        left: 340,
        marginLeft: 0,
        tabID: 1,
        curComp: '',
        isPerfChart: false,
        chartTitle: "Account Performance Chart",
        perText: "Results shown reflect daily close-to-close timesteps, only aplicable to MOC orders.",
        perChartURL: "2017-01-06_v4mini_RiskOff.png",
        rankText: "8 Rank 29 5.8%, Rank Anti-29 -5.8%",
        rankChartURL: "2017-01-06_v4mini_RiskOff.png",
        signals: "",
        dateText: "",
        dateTextDummy: "Signals by account as of",
        dragAccounts: [
            {   // Acount bet 50K..
                bg_url:"chip_maroon.png",
                text:"50K"
            },
            {   // Acount bet 100K..
                bg_url:"chip_maroon.png",
                text:"100K"
            },
            {   // Acount bet 250K..
                bg_url:"chip_maroon.png",
                text:"250K"
            }
        ],
        styles: {
          relative:"text_performance", 
          color:"#111111", 
          size:"14", 
          style:"bold", 
          font:"Book antigua"
        },
        chartData: {}
      };

    	error: any;

      @ViewChild('alarmModal') alarmModal:ModalComponent;

      constructor(
          private router:Router,
          private betService: BetService,
          private betXHRService: BetXHRService,
          private http: Http
      ) {
        this.getRecords();
      	this.getComponentsList();
      }

      ngOnInit() {
        this.config1 = {
            'message': 'Loading New board page...',
            'busy': [this.busyA, this.busyB]
        };
      }


      getRecords() {
        var _this = this;

        this.busyA = this.betService
                      .getRecords()
                      .then(function(response) {

                        _this.recordsMeta = response.first;

                        _this.customBoardStylesMeta = _this.listToObjectPipe.transform(response.first.customstyles);

                        _this.boxStyles = _this.recordsMeta.boxstyles;

                        _this.assignPageMeta();
        
                        _this.parsePerformanceData();

                      })
                      .catch(error => this.error = error);
      }

      assignPageMeta() {
        this.pageMeta.cNone = this.customBoardStylesMeta['cNone'];
        this.pageMeta.colorSection.buttons[0]['label'] = this.customBoardStylesMeta['b_auto_select']['text'];
        this.pageMeta.colorSection.buttons[1]['label'] = this.customBoardStylesMeta['b_reset_colors']['text'];
        this.pageMeta.colorSection.buttons[2]['label'] = this.customBoardStylesMeta['b_save_colors']['text'];

        this.pageMeta.blankBoardSection.buttons[0]['label'] = this.customBoardStylesMeta['b_reset_board']['text'];
        this.pageMeta.blankBoardSection.buttons[1]['label'] = this.customBoardStylesMeta['b_save_board']['text'];

        this.pageMeta.colorSection.errorText = this.customBoardStylesMeta['d_save_color_error']['text'];
        this.pageMeta.blankBoardSection.errorText = this.customBoardStylesMeta['d_save_board_error']['text'];
        this.pageMeta.pageSectionBackground = "#" + this.customBoardStylesMeta['background']['fill-Hex'];

        this.pageMeta.colorSection.subtitle = this.customBoardStylesMeta['text_choose_colors']['text'];
        this.pageMeta.dragDropSection.title = this.customBoardStylesMeta['text_place_components']['text'];
        this.pageMeta.colorDefaults = this.pushAutoSelectColors(this.customBoardStylesMeta['list_autoselect']);
        
        if(this.customBoardStylesMeta['list_loadingscreens']) {
          this.pageMeta.loadingMessages = this.customBoardStylesMeta['list_loadingscreens'];
        }
        
      }

      parsePerformanceData() {
        var performanceCharts = this.recordsMeta['performance'];
        var dictLen = this.componentDict.length;

        // Read Condition Value performance data..
        for(var i = 0; i < dictLen; i++) {
            var dictCell = this.componentDict[i];
            var condValueJSON = performanceCharts[dictCell.webText];
            var condValueData = {};

            // Data for performance chart..
            condValueData['perText'] = condValueJSON['infotext'];
            
            condValueData['0_per_file'] = condValueJSON['v4futures_filename'];
            condValueData['1_per_file'] = condValueJSON['v4mini_filename'];
            condValueData['2_per_file'] = condValueJSON['v4micro_filename'];

            // Data for rank chart..
            condValueData['0_rank_text'] = condValueJSON['v4futures_rank_text'];
            condValueData['0_rank_file'] = condValueJSON['v4futures_rank_filename'];
            condValueData['1_rank_text'] = condValueJSON['v4mini_rank_text'];
            condValueData['1_rank_file'] = condValueJSON['v4mini_rank_filename'];
            condValueData['2_rank_text'] = condValueJSON['v4micro_rank_text'];
            condValueData['2_rank_file'] = condValueJSON['v4micro_rank_filename'];

            // Data for info tab..
            condValueData['dateText'] = condValueJSON['date'];
            condValueData['infoText'] = condValueJSON['infotext2'];
            condValueData['signals'] = condValueJSON['signals'];

            this.performanceChartMeta.chartData[dictCell.webText] = condValueData;
        }
      }

      pushAutoSelectColors(colorsAry) {

        var colors = [];
        
        for(var i=0; i < colorsAry.length; i++) {
            var curColor = "#" + colorsAry[i]['fill-Hex'];
            colors.push(curColor);
        }

        return colors;
      }

      getComponentsList() {
          
          var _this = this;

        	this.busyB = this.betService
          		            .getComponents()
          		            .then(function(response) {
                            _this.components = _this.objectToArrayPipe.transform(response.components);

                            _this.componentsLen = _this.components.length;

                            _this.addComponentMetadata();

                            _this.generateComponentAssoc();

                      })
          		        .catch(error => this.error = error);
      }

      addComponentMetadata() {

        for(var i = 0; i < this.componentsLen; i++) {
            var curComp = this.components[i];

            this.setComponentDefaults(curComp, i);                
        }

      }


      generateComponentAssoc() {
        for(var i = 0; i < this.componentsLen; i++) {
          var curComp =  this.components[i];
          var curCompKey =  curComp['key'];
          this.componentsAssoc[curCompKey] = curComp;
        }
      } 

     setComponentDefaults(curComp, index) {
          curComp['bgColor'] = '#FFFFFF';
          curComp['textColor'] = '#000000';
          curComp['sectionIndex'] = 0;
          curComp['boardIndex'] =  '';
          
          //@TODO: Need to remove this if not used
          curComp['componentIndex'] = index;
     }

     colorSectionAction(type) {
          switch(type) {
            case "auto-select": this.applyAutoSelectColors(); break;
            //Need to group the resets of selectColor, dragDrop and blankBoard
            case "reset": this.applySelectColorReset(); break; 
            case "save": this.applySelectColorSave(); break;
            default: break;
          }
     }

     applyAutoSelectColors() {
          this.pageMeta.colorDefaults = this.arrayShuffle.transform(this.pageMeta.colorDefaults);
          var autoColorsAryLen = this.pageMeta.colorDefaults.length;
          for(var i = 0; i < this.componentsLen; i++) {
            var curComp = this.components[i];

            //Apply auto-select only for the components in select color section
            if(curComp['sectionIndex'] === 0) {
              var defaultColorIndex = i % autoColorsAryLen;
              curComp['bgColor'] = this.pageMeta.colorDefaults[defaultColorIndex];
              curComp['textColor'] = this.returnTextColorRelativeToBackground.transform(curComp['bgColor']);
            }
          
          }   
     }

     applySelectColorReset() {
        for(var i = 0; i < this.componentsLen; i++) {
            var curComp = this.components[i];

            //Apply reset to default colors
            if(curComp['sectionIndex'] === 0) {
              curComp['bgColor'] = '#FFFFFF';
              curComp['textColor'] = '#000000';
            }
        }    
     }

     applySelectColorSave() {
        var tobeDragEnabled = 0;

        //Move any components to draggable section only if Off component is coloured
        //If Off is already coloured and user clicks on reset on the color section, then Off need not be colored again to move components to drag section
        if(this.componentsAssoc['Off']['bgColor'] !== "#FFFFFF" || this.componentOff['bgColor'] !== "#FFFFFF") {
            for(var i = 0; i < this.componentsLen; i++) {
              var curComp = this.components[i];

              //Make the components draggable if their background color is changed(i.e.., not the default #FFFFFF)
              //Since Off is not a draggable component, dont allow it to be moved to draggable section
              if(curComp['sectionIndex'] === 0) {
                  if(curComp['bgColor'] !== "#FFFFFF") {
                    if(curComp['key'] !== "Off") {
                      curComp['sectionIndex'] = 1;
                      tobeDragEnabled++;
                    } else {
                      this.componentOff['bgColor'] = curComp['bgColor'];
                      this.componentOff['textColor'] = curComp['textColor'];              
                    }      
                  } 
              }
            }
        }

        if(!tobeDragEnabled) {
          this.alarmDialog(this.pageMeta.colorSection.errorText, "OK", "");
        }    
     }

     openColorPicker(curComp, $event) {
      $event.stopPropagation();
      this.selectedComponentInput = $event.currentTarget.firstElementChild;
      this.selectedComponentInput.click();

     }

     updateComponentStyles(curComp) {
      curComp['bgColor'] = this.selectedComponentInput.value;
      curComp['textColor'] = this.returnTextColorRelativeToBackground.transform(curComp['bgColor']);
     }

     dragDropSectionAction(type) {
        switch(type) {
          case "reset": this.dragDropSectionReset(); break;
          default: break;
        }
     }

     dragDropSectionReset() {
        for(var i = 0; i < this.componentsLen; i++) {
            var curComp = this.components[i];

            //Move the components back to choose color section
            if(curComp['sectionIndex'] === 1) { 
                  curComp['sectionIndex'] = 0;    
            }
        }
     }

     droppedComponent(event, cellObj) {

        if(cellObj['orgText'] === '') {
            var draggedComponent = event.dragData;
            cellObj['bgColor'] = draggedComponent['bgColor'];
            cellObj['color'] = draggedComponent['textColor'];
            cellObj['text'] = this.componentShorthands[draggedComponent['key']];
            cellObj['orgText'] = draggedComponent['key'];

            draggedComponent['boardIndex'] =  'c' + cellObj['condID'];
            draggedComponent['sectionIndex'] = 2;
        } else {
          return;
        }
     }

    blankBoardAction(type) {
          switch(type) {
            case "reset": this.applyBlankBoardReset(); break; 
            case "save": this.checkBoardSave(); break;
            default: break;
          }
     }

     applyBlankBoardReset() {

        for(var key in this.condCells) {
            var curCellGroup = this.condCells[key];

            for(var i=0; i < curCellGroup.length; i++) {
              var curCell = curCellGroup[i];
              var componentKey = curCell['orgText'];

              if(componentKey !== '') {
                  curCell['color'] = '#000000';
                  curCell['bgColor'] = '#FFFFFF';
                  curCell['text'] = '';
                  curCell['orgText'] = '';  
                
                  //Move the component from blank board to draggable section
                  var componentMeta = this.componentsAssoc[componentKey];
                  componentMeta['boardIndex'] =  '';
                  componentMeta['sectionIndex'] = 1;  
              }
            }
        }
     }

    checkBoardSave() {
      if(this.checkBoardContents()) {
        this.saveBlankBoardNative();
      } else {
        this.alarmDialog(this.pageMeta.blankBoardSection.errorText, "OK", "");
      }
    }

    checkBoardContents() {

      var filledCells = 0;

      for(var cellGrpKey in this.condCells) {
        var curCellGrp = this.condCells[cellGrpKey];

        var curCellLen = curCellGrp.length;
      
        for(var i=0; i < curCellLen; i++) {
          var curCell = curCellGrp[i];

          if(curCell.orgText !== '') {
            //Cell on the board is not empty
            filledCells++;
          } else {
            //Cell is empty  
          }
        }
      }

      return filledCells;
   }   


  saveBlankBoardNative() {
      var _this = this;
      var params = this.db_JSON_Stringify();
      var apiURL = this.baseURL + "/addrecord";

      var data = new FormData();
      data.append('user_id', JSON.stringify(params.user_id));
      data.append('Selection', JSON.stringify(params.Selection));
      data.append('boxstyles', JSON.stringify(params.boxstyles));
      data.append('componentloc', JSON.stringify(params.componentloc));
 
      this.busyC = this.betXHRService.postRequest(apiURL, data)
                        .then(function(response) {
                            _this.alarmDialog("Successfully saved!", "Stay on the page", "Move to board page");
                        })
                        .catch(function(err) {
                            switch(err.status) { 
                                  case 404:  
                                  case 500:  
                                  case 0: 
                                      _this.alarmDialog("Error! Could not save new board data.", "OK","");                               
                                    break;
                                  default: 
                                    break; 
                            }
                        });

      this.config2 = {
        'busy': this.busyC,
        'message': this.pageMeta.loadingMessages[0].newboard
      };                  

  }

  db_JSON_Stringify() {

      this.saveComponentLocations();
      
      var jsonData = {
          'user_id' : 32,
          'Selection' : this.db_Selection,
          'boxstyles' : this.boxStyles,
          'componentloc' : this.componentLoc
      };

      return jsonData;
  }

  saveComponentLocations() {

    var componentLoc = [{
                        "c0": "Off"
                    }];

    for(var cellGrpKey in this.condCells) {
      var curCellGrp = this.condCells[cellGrpKey];

      var curCellLen = curCellGrp.length;
      
      for(var i=0; i < curCellLen; i++) {
        var curCell = curCellGrp[i];

        var curIndex = curCell.condID;
        componentLoc[curIndex] = {};

        var curBoxStyleObj = this.boxStyles[curIndex]['c' + curIndex]

        if(curCell.orgText !== '') {
          //Cell on the board is not empty
          componentLoc[curIndex]['c' + curIndex] = curCell.orgText;

          curBoxStyleObj['text'] = this.componentShorthands[curCell.orgText];

          curBoxStyleObj['fill-Hex'] = curCell.bgColor.substring(1); //Remove preceding #
          
          var hexToRGBObj = this.returnTextColorRelativeToBackground.hexToRgb(curCell.bgColor);

          curBoxStyleObj['fill-R'] = hexToRGBObj.r;
          curBoxStyleObj['fill-G'] = hexToRGBObj.g;
          curBoxStyleObj['fill-B'] = hexToRGBObj.b;
          curBoxStyleObj['text-color'] = curCell.color;

        } else {
          //Cell is empty
          componentLoc[curIndex]['c' + curIndex] = "None";
          this.copyObjectProps(curBoxStyleObj);
        }
      }  
    }

    this.applyOffComponentStyles();

    this.componentLoc = componentLoc;
  }

  copyObjectProps(boxStylesObj) {
    for(var key in boxStylesObj) {
      if(boxStylesObj.hasOwnProperty(key)) {
        boxStylesObj[key] = this.pageMeta.cNone[key];
      }
    }
  }

  applyOffComponentStyles() {

    var offObj = this.boxStyles[0]['c0'];
    var bgColor = this.componentOff['bgColor'];

    if(bgColor !== "#FFFFFF") {
      var hexToRGBObj = this.returnTextColorRelativeToBackground.hexToRgb(bgColor);

      offObj['fill-Hex'] = bgColor.substring(1); //Remove preceding #

      offObj['fill-R'] = hexToRGBObj.r;
      offObj['fill-G'] = hexToRGBObj.g;
      offObj['fill-B'] = hexToRGBObj.b;
      offObj['text-color'] = this.componentOff.textColor;
    }
  }

  redirectCallback() {
    this.alarmModal.close();
    // Redirecting to board page once the new board changes are saved successfully...
    // @TODO: Need to do this more efficiently
    this.router.navigate(['/']);
  }

  /* Need to move this code to common service or component */
  alarmDialog(alarmText, alarmButton, redirectButton) {
      this.alarmText = alarmText;
      this.alarmOKBtnText = alarmButton;
      this.alarmRedirectBtnText = redirectButton;
      this.alarmModal.open();
  }


  /* Code for performance chart in new board. Need to resue the code between new board and board page */
  performanceChart(component) {
      // For Conditions value chart..
      this.performanceChartMeta.curComp = component;
      this.performanceChartMeta.chartTitle = "Performance Chart : " + component;
      this.performanceChartMeta.isPerfChart = true;
      this.onTabItem(1);
  }

  onTabItem(itemID) {
    this.performanceChartMeta.tabID = itemID;
    var idx = itemID - 2;

    // For living..
    var objData = this.performanceChartMeta.chartData[this.performanceChartMeta.curComp];
    if(this.performanceChartMeta.tabID == 1) {
        this.performanceChartMeta.perText = objData['perText'];
        this.performanceChartMeta.signals = objData['signals'];
        this.performanceChartMeta.dateText = this.performanceChartMeta.dateTextDummy + ' ' + objData['dateText'];
    } else {
        this.performanceChartMeta.perText = objData['infoText'];
        this.performanceChartMeta.perChartURL = objData[idx + '_per_file'];
        this.performanceChartMeta.rankText = objData[idx + '_rank_text'];
        this.performanceChartMeta.rankChartURL = objData[idx + '_rank_file'];
        this.performanceChartMeta.dateText = '';
    }
  }

}