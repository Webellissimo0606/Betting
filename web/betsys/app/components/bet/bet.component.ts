import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { NgStyle } from '@angular/common'
import { Router } from '@angular/router';
import { ModalComponent } from 'ng2-bs3-modal/ng2-bs3-modal';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { htmlTemplate } from './bet.component.html';
import { BetService, BetXHRService }    from 'app/services/bet.service';
import { ReturnTextColorRelativeToBackground }  from 'app/pipes/bet.pipes';
import { ListToObjectTransform, 
         ReturnTextColorRelativeToBackground }  from 'app/pipes/bet.pipes';
import * as moment_ from 'moment';         
 
@Component({
    // moduleId : module.id,
    selector : 'relative-path',
    template : htmlTemplate
})

export class BetComponent implements OnInit {
    /*-------------------------------------------------------------------*/
    /*---------------------------- Variables ----------------------------*/
    /*-------------------------------------------------------------------*/
    
    // For database and server URLs..
    // baseURL = "http://localhost:8000";
    baseURL = "";

    busyA: Promise<any>;
    busyB: Promise<any>;
    busyC: Promise<any>;
    busyD: Promise<any>;
    busyE: Promise<any>;

    busyF: Promise<any>;

    // DOM of interface..
    @ViewChild('leftPane') leftPane:ElementRef;
    @ViewChild('betbox') betBox:ElementRef;
    @ViewChild('rightPane') rightPane:ElementRef;
    @ViewChild('bottomBlank') bottomBlank:ElementRef;
    @ViewChild('bottomPane') bottomPane:ElementRef;
    @ViewChild('bottomCell') bottomCell:ElementRef;
    @ViewChild('betCell') betCell:ElementRef;
    @ViewChild('betAccount') betAccount:ElementRef;
    @ViewChild('betAccountObj') betAccountObj:ElementRef;
    @ViewChild('nextTriggerTimePane') nextTriggerTimePane:ElementRef;
    // Time..
    @ViewChild('curYearPane') curYearPane:ElementRef;
    @ViewChild('curTimePane') curTimePane:ElementRef;
    @ViewChild('timeZonePane') timeZonePane:ElementRef;
    // Modal..
    @ViewChild('cfgModalVote') cfgModalVote:ModalComponent;
    @ViewChild('cfgModalOff') cfgModalOff:ModalComponent;
    @ViewChild('alarmModal') alarmModal:ModalComponent;
    @ViewChild('confirmModal') confirmModal:ModalComponent;

    const moment:moment.MomentStatic = (<any>moment_)['default'] || moment_;
    
    // Component dictionary features..
    componentDict = [
        {id:0,      webText:"LowestEquity",        dictText:"0.5LastSIG",          condRelative:10 },
        {id:1,      webText:"AntiLowestEquity",   dictText:"Anti0.5LastSIG",      condRelative:22 },
        {id:2,      webText:"HighestEquity",       dictText:"1LastSIG",            condRelative:11 },
        {id:3,      webText:"AntiHighestEquity",  dictText:"Anti1LastSIG",        condRelative:12 },
        {id:4,      webText:"Previous",            dictText:"prevACT",             condRelative:20 },
        {id:5,      webText:"Anti-Previous",       dictText:"AntiPrevACT",         condRelative:21 },
        {id:6,      webText:"50/50",               dictText:"0.75LastSIG",         condRelative:30 },
        {id:7,      webText:"Anti50/50",           dictText:"Anti0.75LastSIG",     condRelative:13 },
        {id:8,      webText:"Seasonality",         dictText:"LastSEA",             condRelative:14 },
        {id:9,      webText:"Anti-Seasonality",    dictText:"AntiSEA",             condRelative:15 },
        {id:10,     webText:"Custom",              dictText:"Custom",              condRelative:31 },
        {id:11,     webText:"Anti-Custom",         dictText:"AntiCustom",          condRelative:32 },
        {id:12,     webText:"RiskOn",              dictText:"RiskOn",              condRelative:0 },
        {id:13,     webText:"RiskOff",             dictText:"RiskOff",             condRelative:1 }
    ];

    //Mapping component id with its relative position on the bet table
    compIdToPosMap = {
        1: 0,
        2: 1,
        3: 10,
        4: 11,
        5: 12,
        6: 13,
        7: 14,
        8: 15,
        9: 20,
        10: 30,
        11: 21,
        12: 31,
        13: 22,
        14: 32
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

    boxStylesDict = {};

    shortToComponentAssoc = {};

    componentsPosMap = {};

    customBoardStylesMeta = {};
    loadingMessages = [{
        'newboard': 'Please wait 10-15 minutes for the charts to be recreated.'    
    }, {
        'immediate': 'Please wait up to five minutes for immediate orders to be processed.'    
    }, {
        'else': 'Please wait up for the board to load.'    
    }];

    returnTextColorRelativeToBackground = new ReturnTextColorRelativeToBackground();

    // Account data object..
    dragAccounts = [
        {   // Acount bet 50K..
            id:0, bg_url:"chip_maroon.png", display:"table-cell",
            dragRow:-1, dragCol:-1, dragOrder:-1,
            prevDragRow:-1, prevDragCol:-1, prevDragOrder:-1,
            text:"50K", nextBet:"Off", orderType:"Off", iNextBet:-1, iOrderType: - 1,
            column1:"$ 2,400", column1Clr:"red", column2:"$ 54,400", lastUpdate:"2016/12/22 09:00:00 EST",
        },
        {   // Acount bet 100K..
            id:1, bg_url:"chip_maroon.png", display:"table-cell",
            dragRow:-1, dragCol:-1, dragOrder:-1,
            prevDragRow:-1, prevDragCol:-1, prevDragOrder:-1,
            text:"100K", nextBet:"Off", orderType:"Off", iNextBet:-1, iOrderType: - 1,
            column1:"$ 4,400", column1Clr:"red", column2:"$ 512,400", lastUpdate:"2016/12/22 09:00:01 EST",
        },
        {   // Acount bet 250K..
            id:2, bg_url:"chip_maroon.png", display:"table-cell",
            dragRow:-1, dragCol:-1, dragOrder:-1,
            prevDragRow:-1, prevDragCol:-1, prevDragOrder:-1,
            text:"250K", nextBet:"Off", orderType:"Off", iNextBet:-1, iOrderType: - 1,
            column1:"$ 22,400", column1Clr:"red", column2:"$ 354,400", lastUpdate:"2016/12/22 09:00:02 EST",
        },
    ];
    curDragIdx = 0;

    // For bet box..
    cols = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
    col_items = [0, 1, 2];
    betCells = [];

    // For the styles and data of buttons on the panel..
    buttonCells = [
        {id:0, relative:"b_clear_all",      color:"#111111", tsize:14, bgColor:"#FFFFFF", tstyle:"bold", font:"Book antigua", text:"Clear All Bets"},
        {id:1, relative:"b_create_new",     color:"#111111", tsize:14, bgColor:"#FFFFFF", tstyle:"bold", font:"Book antigua", text:"Create New Board"},
        {id:2, relative:"b_confirm_orders", color:"#111111", tsize:14, bgColor:"#FFFFFF", tstyle:"bold", font:"Book antigua", text:"Confirm Orders"},
    ];

    // For the styles of table..
    tableStyles = [
        {id:0, relative:"text_table",           color:"#000000", font:"Book Antigua", size:"18", style:"normal"},
        {id:1, relative:"text_table_title",     color:"#000000", font:"Book Antigua", size:"18", style:"normal"},
    ];

    // For the styles of Current time and trigger time..
    timeStyles = [
        {id:0, relative:"text_datetimenow",     color:"#000000", font:"Book Antigua", size:"18", style:"normal"},
        {id:1, relative:"text_triggertimes",    color:"#000000", font:"Book Antigua", size:"18", style:"normal"},
    ];

    // For the styles of Current time and trigger time..
    chipStyles = [
        {id:0, relative:"chip_v4micro",     color:"#000000", img:"chip_maroon.png", text:"501K"},
        {id:1, relative:"chip_v4mini",      color:"#000000", img:"chip_maroon.png", text:"1010K"},
        {id:2, relative:"chip_v4futures",   color:"#000000", img:"chip_maroon.png", text:"2510K"},
    ];

    // For the dialog styles..
    dlgStyles = [
        {id:0, relative:"b_order_ok",       color:"#111111", size:"14", bgColor:"#FFFFFF", style:"bold", font:"Book antigua", text:"Clear All Bets"},
        {id:1, relative:"b_order_cancel",   color:"#111111", size:"14", bgColor:"#FFFFFF", style:"bold", font:"Book antigua", text:"Clear All Bets"},
        {id:2, relative:"b_order_active",   color:"#111111", size:"14", bgColor:"#FFFFFF", style:"bold", font:"Book antigua", text:"Clear All Bets"},
        {id:3, relative:"b_order_inactive", color:"#111111", size:"14", bgColor:"#FFFFFF", style:"bold", font:"Book antigua", text:"Clear All Bets"},
        {id:4, relative:"b_save_ok",        color:"#111111", size:"14", bgColor:"#FFFFFF", style:"bold", font:"Book antigua", text:"Clear All Bets"},
        {id:5, relative:"b_save_cancel",    color:"#111111", size:"14", bgColor:"#FFFFFF", style:"bold", font:"Book antigua", text:"Clear All Bets"},
        {id:6, relative:"d_order_dialog",   color:"#111111", size:"14", bgColor:"#FFFFFF", style:"bold", font:"Book antigua", text:"Clear All Bets"},
        {id:7, relative:"d_save_dialog",    color:"#111111", size:"14", bgColor:"#FFFFFF", style:"bold", font:"Book antigua", text:"Clear All Bets"},
    ];

    // For the styles of table cells..
    tableCells = [
        {id:1,  bgColor:"#FFFFFF", text:"1", color:"#FF0000", font:"normal", size:"24", style:"bold"},
        {id:2,  bgColor:"#FFFFFF", text:"1", color:"#FF0000", font:"normal", size:"24", style:"bold"},
        {id:3,  bgColor:"#FFFFFF", text:"1", color:"#FF0000", font:"normal", size:"24", style:"bold"},
        {id:4,  bgColor:"#FFFFFF", text:"1", color:"#FF0000", font:"normal", size:"24", style:"bold"},
        {id:5,  bgColor:"#FFFFFF", text:"1", color:"#FF0000", font:"normal", size:"24", style:"bold"},
        {id:6,  bgColor:"#FFFFFF", text:"1", color:"#FF0000", font:"normal", size:"24", style:"bold"},
        {id:7,  bgColor:"#FFFFFF", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:8,  bgColor:"#FFFFFF", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:9,  bgColor:"#FFFFFF", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:10, bgColor:"#FFFFFF", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:11, bgColor:"#FFFFFF", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:12, bgColor:"#FFFFFF", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:13, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:14, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:15, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:16, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:17, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:18, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:19, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:20, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:21, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:22, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:23, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:24, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:25, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:26, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:27, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:28, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:29, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:30, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:31, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:32, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:33, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:34, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:35, bgColor:"#D84219", text:"1", color:"#FF0000", font:"Book Antigua", size:"24", style:"bold"},
        {id:36, bgColor:"#D84219", text:"1", color:"#000000", font:"Book Antigua", size:"24", style:"bold"},
    ];

    // Row condition 1..
    condCells = [
        // Main condition..
        [
            {id:0, dragItem:[-1, -1, -1], color:"#111111", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:12, text:"RiskOn", orgText:"RiskOn"},
            {id:1, dragItem:[-1, -1, -1], color:"#111111", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:13, text:"RiskOff", orgText:"RiskOff"}
        ],
        // Col condition..
        [
            {id:0, dragItem:[-1, -1, -1], color:"#348CE8", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:0, text:"LowestEquity", orgText:"LowestEq"},
            {id:1, dragItem:[-1, -1, -1], color:"#E69313", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:2, text:"HighestEquity", orgText:"HighestEq"},
            {id:2, dragItem:[-1, -1, -1], color:"#C5B9B9", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:3, text:"AntiHighestEquity", orgText:"Anti-HE"},
            {id:3, dragItem:[-1, -1, -1], color:"#C760C4", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:7, text:"Anti50/50", orgText:"Anti-50"},
            {id:4, dragItem:[-1, -1, -1], color:"#3C763D", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:8, text:"Seasonality", orgText:"Seasonality"},
            {id:5, dragItem:[-1, -1, -1], color:"#111111", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:9, text:"Anti-Seasonality", orgText:"Anti-Sea"}
        ],
        // Row condition 1..
        [
            {id:0, dragItem:[-1, -1, -1], color:"#D22B8F", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:4, text:"Previous", orgText:"Previous"},
            {id:1, dragItem:[-1, -1, -1], color:"#31C31D", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:5, text:"Anti-Previous", orgText:"Anti-Previous"},
            {id:2, dragItem:[-1, -1, -1], color:"#111111", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:-1, text:"none", orgText:"none"}            
        ],
        // Row condition 2..
        [
            {id:0, dragItem:[-1, -1, -1], color:"#111111", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:-1, text:"none", orgText:"none"},
            {id:1, dragItem:[-1, -1, -1], color:"#111111", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:-1, text:"none", orgText:"none"},
            {id:2, dragItem:[-1, -1, -1], color:"#111111", tsize:24, tstyle:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:-1, text:"none", orgText:"none"}
        ]
    ];

    offCell = {id:2, color:"#111111", size:24, style:"bold", font:"Book Antigua", bgColor:"#FFFFFF", condID:-1, text:"none", orgText:"none"};

    // For trigger data..
    triggerData = [];
    nextTriggerIdx = 0;
    nextTriggerTime = "UNKNOWN";
    nextMOCTime = "";

    // For dialog..
    antiOpt = false;
    voteText = "";
    antiVoteText = "";
    voteType = 0;
    entryType = 0;

    // For bet margins..
    betMargins = [0, 0, 0];
    chartBTNMargins = [0, 0, 0];
    chartBTNWidth = 26;
    betCellWidths = [0, 0, 0];

    // Image size and margin..
    betCellImgMarginLeft = 5;
    paneCellImgMarginLeft = 5;
    bpaneCellImgMarginLeft = 5;

    // For alarm dialog and confirm dialog..
    alarmText = "";
    alarmOKBtnText = "OK";
    confirmBtnText = "OK";
    confirmText = "";
    confirmConstant = -1;

    // For recent and previous..
    recentData = [];
    bShowRecentData = false;
    recentDataDynamicHeaders = [];
    dynamicColumnWidth = 6;


    // For test..
    test_value1 = "";
    test_value2 = "";

    // For Account data table..
    accountTableColumn1 = "";
    accountTableColumn2 = "";

    // For chart dialog..
    isChartBox1 = false;
    isChartBox2 = false;

    isChartBox3 = false;
    isChartBox4 = false;

    config1 = {
        'busy': '',
        'message': ''
    };

    config2 = {
        'busy': '',
        'message': ''
    };

    chartInfo1 = [{
        id:1, top: 300, left: 340, marginLeft: 0,
        chipText:"50K", chipImg:"chip_maroon.png",
        chartTitle:"Account Performance Chart",
        chartURL:"2017-01-06_v4mini_RiskOff.png",
        bodyText:"This chart shows results from all betting activites of the player"
    }];

    chartInfo2 = [{
        id:2, top:400, left: 340,
        chartTitle:"Account Performance Chart",
        perText:"Results shown reflect daily close-to-close timesteps, only aplicable to MOC orders.",
        perChartURL:"2017-01-06_v4mini_RiskOff.png",
        rankText:"8 Rank 29 5.8%, Rank Anti-29 -5.8%",
        rankChartURL:"2017-01-06_v4mini_RiskOff.png",
        signals:"",
        dateTextDummy: "Signals by account as of",
        dateText: ""
    }];

    chartInfo3 = {
        id:3, top:400, left: 340,
        tabID: 0,
        subType: 0,
        chartTitle:"",
        tabsList: [],
        tabBody: {
            'text': '',
            'html': ''
        },
        tabKeys: ['v4micro', 'v4mini', 'v4futures'],
        tabIDAssoc: [{
            'text': 'status_text',
            'html': 'status',
            'isImage': false 
        }, {
            'text': 'pnl_text',
            'html': 'pnl',
            'isImage': false 
        }, {
            'text': 'slippage_text',
            'html': 'slippage',
            'isImage': true 
        }],
        chartData: {}
    };

    chartInfo4 = {
        id:4, top:400, left: 340,
        tabID: 0,
        chartTitle:"Immediate Orders Timetable",
        tabBody: {},
        tabKeys: ['info', 'v4futures', 'v4mini', 'v4micro'],
        chartData: {},
        styleKey: 'text_immediate_orders',
        titleText: "Immediate Orders"
    };


    loading_messages = {
        "immediate": "Please wait up to five minutes for immediate orders to be processed.",
        "normal": "Please wait up for the board to load.",
        "new_board": "Please wait 10-15 minutes for the charts to be recreated."
    };   

    chartStyle = [
        {id:0, relative:"text_performance", color:"#111111", size:"14", style:"bold", font:"Book antigua"},
        {id:1, relative:"text_performance_account", color:"#111111", size:"14", style:"bold", font:"Book antigua"}
    ]

    tabID = 1;
    curBetPerformance = "";

    chartData = {};
    components = {};
    anticomponents = {};

    listToObjectPipe = new ListToObjectTransform();

    /*-------------------------------------------------------------------*/
    /*---------------------------- Functions ----------------------------*/
    /*-------------------------------------------------------------------*/
    constructor(
        private router:Router,
        private betService: BetService,
        private betXHRService: BetXHRService,
        private http: Http
    ){
        for(var i = 0; i < this.cols.length; i++) {
            var oneRow = [];
            for(var j = 0; j < this.col_items.length; j++) {
                oneRow.push([-1, -1, -1]);
            }
            this.betCells.push(oneRow);
        }

        // Set timer..
        this.currentTime();

        // Get information from server..
        this.getPreviousBettingInfo();
        this.getMetaDataInfo();
        this.getAccountDataInfo();

        //Get data to display Immediate Orders Dialogue
        this.getTimeTableInfo();

        this.getUnrealizedPNLDataInfo();

        this.createCondCellsAssoc();

        this.createShortToComponentAssoc();
    }

    ngOnInit() {

        this.config1 = {
            'message': 'Loading board data...',
            'busy': [this.busyA, this.busyB, this.busyC, this.busyD, this.busyE]
        };
    }

    // Set size of left pane and account image..
    onResize(event, idx) {
        /*  
            idx : 0 -> table cell, 
            idx : 1 -> pane1 cell,
            idx : 2 -> pane2 cell,
        */

        // Total width of table div..
        var boxWidth = this.betBox.nativeElement.offsetWidth;

        // Set margin of bet in bet table and component pane..
        var betWidth = 50;
        var cellWidths = [0, 0, 0];
        cellWidths[0] = boxWidth * 0.06;
        cellWidths[1] = boxWidth * 0.1;
        cellWidths[2] = cellWidths[0] * 2;

        for(var i in cellWidths) {
            this.betCellWidths[i] = cellWidths[i] / 3;
            this.betMargins[i] = (this.betCellWidths[i] - betWidth) / 2;
            this.chartBTNMargins[i] = cellWidths[i] - this.chartBTNWidth - 3;   // 2 is for border..
        }

        // console.log("[Bet.Component] Betting Table Width : ", boxWidth);


        // Get width of image..
        if(this.betAccount !== undefined) {
            var cellWidth = 0;
            // Because image width is hang to 60, 2 is margin..
            switch (idx) {
                case 0:         // For table cell..
                    cellWidth = this.betCell.nativeElement.offsetWidth;
                    this.betCellImgMarginLeft = (cellWidth - 62) / 2;
                    // console.log("[Bet.Component] Margin Left of bet cell ->", this.betCellImgMarginLeft, cellWidth);
                    break;
                case 1: case 2: // For pane1 & 2 cell..
                    cellWidth = this.rightPane.nativeElement.offsetWidth;
                    this.paneCellImgMarginLeft = (cellWidth - 62) / 2;
                    // console.log("[Bet.Component] Margin Left of right pane ->", this.paneCellImgMarginLeft, cellWidth);
                    break;
                case 3:         // For bottom cell..
                    cellWidth = this.bottomCell.nativeElement.offsetWidth;
                    this.bpaneCellImgMarginLeft = (cellWidth - 62) / 2;
                    // console.log("[Bet.Component] Margin Left of bottom pane ->", this.bpaneCellImgMarginLeft, cellWidth);
                    break;
            }
        }
		
		//this.adjustChartPanePosition();
    }

    ngAfterViewInit() {
        // Set initial size..
        console.log("Initialilzed Finished");
        this.onResize(null, 0);
    }

    hideChartDialogues() {
        this.isChartBox1 = false;
        this.isChartBox2 = false;
        this.isChartBox3 = false;
        this.isChartBox4 = false;
    }

    onDropSuccess($event, idCol, idRow) {
        this.onResize(null, 0);
        
        this.hideChartDialogues();
        
        // Get drag object..
        var dragData = $event.dragData;
        var dragObj = this.dragAccounts[dragData.id];
        console.log("[Bet.Component] Dragging Object ->", dragData, idRow, idCol);

        // Remove from original dragged position..
        var curDragRegion = dragObj.dragCol;
        console.log("[Bet.Component] Dragging From ->", curDragRegion);

        // Region drag from..
        if(curDragRegion == -1) {               // Bet account region..
            dragObj.display = "none";
        } else if(curDragRegion < 12) {         // Bet table region..
             this.betCells[dragObj.dragCol][dragObj.dragRow][dragObj.dragOrder] = -1;
        } else {
            var condIdx = curDragRegion - 12;
            console.log("[Bet.Component] Data before Init bet cell ->", this.condCells[condIdx][dragObj.dragRow].dragItem);
            this.condCells[condIdx][dragObj.dragRow].dragItem[dragObj.dragOrder] = -1;
            console.log("[Bet.Component] Data after Init bet cell ->", this.condCells[condIdx][dragObj.dragRow].dragItem);
        }

        var idx = -1;
        var condID:any;
        var antiCondID:any;

        // Drag into region..
        console.log("[Bet.Component] Dragging to ->", idCol);
        dragObj.prevDragCol = dragObj.dragCol;
        dragObj.prevDragRow = dragObj.dragRow;
        dragObj.prevDragOrder = dragObj.dragOrder;

        if(idCol === -1) {                              // For bet account region..
            dragObj.display = "table-cell";
            dragObj.dragCol = -1; dragObj.dragRow = -1;
            dragObj.dragOrder = -1;
            dragObj.nextBet = "Off";
            // dragObj.orderType = "Off";
            dragObj.iNextBet = -1;
            // dragObj.iOrderType = -1;
            this.voteText = "Off";
            this.antiVoteText = "";
            this.antiOpt = false;
            this.voteType = 0;
        } else {
            dragObj.dragCol = idCol;
            dragObj.dragRow = idRow;

            if(idCol < 12) {                            // For bet table cell region..
                // For dragging to bet table region..
                var orders = this.betCells[dragObj.dragCol][dragObj.dragRow];
                for(var order = 0; order < 3; order++) {
                    if(orders[order] == -1) {
                        orders[order] = dragData.id;
                        break;
                    }
                }
                console.log("[Bet.Component] Bet Cell Order Data ->", orders, this.betCells[dragObj.dragCol][dragObj.dragRow])
                dragObj.dragOrder = order;
                this.voteText = "Voting" + (this.cols[idCol] - idRow);
                this.antiVoteText = "Anti-" + this.voteText;

                idx = 0;
                this.antiOpt = true;
            } else {
                var paneObj:any;
                idx = idCol - 11;
                paneObj = this.condCells[idx - 1][idRow];
                console.log("[Bet.Component] Pane Object to Draw ->", paneObj);
                var curPaneId = this.componentDict[paneObj['condID']].id;
                var antiPaneId = 0;
                if(curPaneId % 2 == 1) {
                    antiPaneId = curPaneId - 1;
                } else {
                    antiPaneId = curPaneId + 1;
                }
                var antiObj = this.componentDict[antiPaneId];
                console.log("[Bet.Component] Pane Anit Object to Draw ->", antiObj);
                //if(antiObj.condRelative == -1) {
                //    this.antiOpt = true;
                //} else {
                //    this.antiOpt = false;
                //}

                this.antiOpt = true;    

                for(var order = 0; order < 3; order++) {
                    if(paneObj.dragItem[order] == -1) {
                        paneObj.dragItem[order] = dragData.id;
                        break;
                    }
                }

                dragObj.dragOrder = order;
                this.voteText = this.componentDict[paneObj.condID].webText;
                condID = paneObj.condID;

                if(condID % 2 == 0) {
                    antiCondID = condID + 1;
                } else {
                    antiCondID = condID - 1;
                }
                this.antiVoteText = this.anticomponents[this.componentDict[paneObj.condID].webText];
                console.log("[Bet.Component] Anti ID : ", antiCondID);
            }
        }

        // console.log("[Bet.Component] Account Data ->", this.dragAccounts);
        
        this.curDragIdx = dragData.id;
        // Check dialog..
        if(this.voteText !== "") {
            this.cfgModalVote.open();
        } else {
            this.cfgModalOff.open();
        }

        this.onResize(null, idx);
    }

    // Voting dialog..
    cfgModalTextStyle(maintype, subtype, styletype) {
        if(maintype == 0) {
            if(subtype == this.voteType) {
                if(styletype == 0) {
                    return this.dlgStyles[2].bgColor;
                } else if (styletype == 1) {
                    return this.dlgStyles[2].size;
                } else if (styletype == 2) {
                    return this.dlgStyles[2].font;
                } else {
                    return this.dlgStyles[2].style;
                }
            } else {
                if(styletype == 0) {
                    return this.dlgStyles[3].bgColor;
                } else if (styletype == 1) {
                    return this.dlgStyles[3].size;
                } else if (styletype == 2) {
                    return this.dlgStyles[3].font;
                } else {
                    return this.dlgStyles[3].style;
                }
            }
        } else {
            if(subtype == this.entryType) {
                if(styletype == 0) {
                    return this.dlgStyles[2].bgColor;
                } else if (styletype == 1) {
                    return this.dlgStyles[2].size;
                } else if (styletype == 2) {
                    return this.dlgStyles[2].font;
                } else {
                    return this.dlgStyles[2].style;
                }
            } else {
                if(styletype == 0) {
                    return this.dlgStyles[3].bgColor;
                } else if (styletype == 1) {
                    return this.dlgStyles[3].size;
                } else if (styletype == 2) {
                    return this.dlgStyles[3].font;
                } else {
                    return this.dlgStyles[3].style;
                }
            }            
        }
    }

    onOKVote() {
        var account = this.dragAccounts[this.curDragIdx];

        // For off pane..
        if(this.voteText == "") {
            if(this.entryType == 0) {       // For MOC order type..
                account.orderType = "MOC " + this.curTimeWithType(0);
            } else {                        // For Immediate order type..
                account.orderType = "Immediate";
            }
            account.iOrderType = this.entryType;
            return;
        }

        // For next bet..
        if(this.voteType == 0) {        // For normal voting..
            account.nextBet = this.voteText;
        } else {                        // For anti voting..
            account.nextBet = this.antiVoteText;
        }
        account.iNextBet = this.voteType;

        // For order type..
        if(this.entryType == 0) {       // For MOC order type..
            account.orderType = "MOC " + this.curTimeWithType(0);
        } else {                        // For Immediate order type..
            account.orderType = "Immediate";
        }
        account.iOrderType = this.entryType;
        console.log("[Bet.Component] Object Finished : ", this.dragAccounts[this.curDragIdx]);
    }

    onCancelVote() {
        var account = this.dragAccounts[this.curDragIdx];

        console.log("[Bet.Component] Drag : ", account.dragCol, account.dragRow);
        var idCol = account.dragCol;
        var idRow = account.dragRow;

        // Drag item reset..
        if(idCol == -1) {
            return;
        }

        if(idCol < 12) {                            // For bet table region..
            this.betCells[idCol][idRow][account.dragOrder] = -1;
            //this.betCells[account.prevDragCol][account.prevDragRow][account.prevDragOrder] = this.curDragIdx;
            console.log("[Bet.Component] Order Data After Cancel ->", this.betCells[idCol][idRow]);
        } else {
            var condIdx = idCol - 12;
            this.condCells[condIdx][idRow].dragItem[account.dragOrder] = -1;
            //this.condCells[account.prevDragCol - 12][account.prevDragRow].dragItem[account.prevDragOrder] = this.curDragIdx;
        }

        account.prevDragCol = account.dragCol;
        account.prevDragRow = account.dragRow;
        account.dragCol = -1;
        account.dragRow = -1;
        account.nextBet = "Off";
        account.orderType = "MOC 20170130";
        account.iNextBet = -1;
        account.iOrderType = -1;
        account.dragOrder = -1;

        //account.dragCol = account.prevDragCol;
        //account.dragRow = account.prevDragRow;
        //account.dragOrder = account.prevDragOrder; 

        account.display = "table-cell";
    }

    onReset() {

        for(var i = 0; i < 3; i++) {
            // Reset for off panel and drag account information..
            this.dragAccounts[i].dragCol = -1;
            this.dragAccounts[i].dragRow = -1;
            this.dragAccounts[i].prevDragCol = -1;
            this.dragAccounts[i].prevDragRow = -1;
            this.dragAccounts[i].display = "table-cell";
            this.dragAccounts[i].nextBet = "Off";
            this.dragAccounts[i].orderType = "MOC 20170130";
            this.dragAccounts[i].iNextBet = -1;
            this.dragAccounts[i].iOrderType = -1;
            this.dragAccounts[i].dragOrder = -1;

            // Reset for bet table..
            for(var j = 0; j < this.cols.length; j++) {
                this.betCells[j][i] = [-1, -1, -1];
            }

            // Reset for condCells..
            this.condCells[2][i].dragItem = [-1, -1, -1];
            this.condCells[3][i].dragItem = [-1, -1, -1];
            this.condCells[1][i].dragItem = [-1, -1, -1];
            this.condCells[1][i + 3].dragItem = [-1, -1, -1];
        }

        // Reset for main_cond..
        this.condCells[0][0].dragItem = [-1, -1, -1];
        this.condCells[0][1].dragItem = [-1, -1, -1];

        // Reset for chart dialog..
        this.hideChartDialogues();
    }


    /*------------------------- For cell in table ---------------------------------*/
    topBorderRadius(idx, flag) {
        // Return border radius..
        if((idx == 0 && flag == 0) || (idx == 11 && flag == 1)) {
            return 26;
        } else {
            return 0;
        }
    }

    cellInfo_ImageMargin(idxPanel) {
        // Return image margin..
        if(idxPanel == 0) {
            return this.betCellImgMarginLeft + "px";
        } else if(idxPanel == 1) {
            return this.paneCellImgMarginLeft + "px";
        } else if(idxPanel == 2) {
            return this.bpaneCellImgMarginLeft + "px";
        }
    }

    // Get informiation of account according to type..
    cellInfo(idCol, idRow, infoType, idxBetCell): any {
        /*
            infoType = 0 : Get image of account,
            infoType = 1 : Get Text of account,
            infoType = 2 : Get display state of account,
            infoType = 3 : Get drag data of account,
            infoType = 4 : Get drag region of account,
        */

        var idx = -1;
        var dragRegion = 'drop-cell';
        var condID = -1;

        // Select id of dropped account..
        if(idCol < 12) {
            idx = this.betCells[idCol][idRow][idxBetCell];
        } else {
            var condIdx = idCol - 12;

            idx = this.condCells[condIdx][idRow].dragItem[idxBetCell];
            condID = this.condCells[condIdx][idRow].condID;
        }

        if(condID == -1) {
            dragRegion = '';
        } else {
            dragRegion = 'drop-cell';
        }

        // console.log("[Bet.Component] Image Index ->", idx);
        if(idx == -1) {
            if(infoType < 2) {
                return "";
            } else if(infoType == 2) {
                return false;
            } else if(infoType == 3) {
                return undefined;
            } else if(infoType == 4) {
                return dragRegion;
            }
        } else {
            if(infoType == 0){
                return "url('static/public/images/" + this.dragAccounts[idx].bg_url + "')";
            } else if(infoType == 1){
                // console.log("[Bet.Component] Drag Account Text : ", idx, this.dragAccounts[idx].text, this.dragAccounts[idx]);
                return this.dragAccounts[idx].text;
            } else if(infoType == 2) {
                return true;
            } else if(infoType == 3) {
                return this.dragAccounts[idx];
            } else if(infoType == 4) {
                return dragRegion;
            }
        }
    }


    /*------------------------- For information of time ---------------------------------*/
    curTimeWithType(type) {
        /*
            type = 0 : 20161201,                    - Entry time..
            type = 1 : 2016/12/01 09:00:00 EST,     - Time stamp..
        */
        var now = new Date();
        var estMiliTime = now.getTime() + (now.getTimezoneOffset() - 300) * 60000;

        if(type == 0) {
            // Get Day of week..
            var tempDate = new Date(estMiliTime);
            var nDOW = tempDate.getDay();
            // Get compare minute..
            var compMin = tempDate.getHours() * 60 + tempDate.getMinutes();
            // console.log("[Bet.Component] Compare minute ->", compMin, nDOW);
            // Compare if it passed 16:25..
            if(compMin >= 985) {
                nDOW += 1;
                estMiliTime += 8 * 3600000;
            }
            if(nDOW == 0) nDOW = 7;
            // Compare if display day is must be next week..
            if(nDOW > 5) {
                // Increasable day number..
                var nPDay = (8 - nDOW);
                estMiliTime += nPDay * 3600 * 24000; 
            }
            // console.log("[Bet.Component] EST Milli Time Week ->", nDOW);
        }

        var estTime = new Date(estMiliTime);
        var nYear = estTime.getFullYear();
        var nTemp = estTime.getMonth() + 1;
        var nMonth = nTemp > 9 ? nTemp : '0' + nTemp;
        var nTemp = estTime.getDate();
        var nDay = nTemp > 9 ? nTemp : '0' + nTemp;
        var nTemp = estTime.getHours();
        var nHour = nTemp > 9 ? nTemp : '0' + nTemp;
        var nTemp = estTime.getMinutes();
        var nMin = nTemp > 9 ? nTemp : '0' + nTemp;
        var nTemp = estTime.getSeconds();
        var nSec = nTemp > 9 ? nTemp : '0' + nTemp;
        // console.log("[Bet.Component] EST Milli Time ->", estMiliTime, now.getTimezoneOffset());
        // console.log("[Bet.Component] EST Time ->", estTime);

        var strDate;
        if(type == 0) {
            strDate = '' + nYear + nMonth + nDay;
        } else if(type == 1) {
            strDate = nYear + "/" + nMonth + "/" + nDay + " " + nHour + ":" + nMin + ":" + nSec + " EST";
        }

        return strDate;
    }

    curTimer() {
        setTimeout(()=>{this.currentTime();}, 1000);
    }

    currentTime() {
        
        var strDate = moment().tz('America/New_York').format('YYYY/MM/DD');
        var strTime = moment().tz('America/New_York').format('HH:mm:ss');
        

        if(this.curTimePane !== undefined) {
            this.curYearPane.nativeElement.innerHTML = strDate;
            this.curTimePane.nativeElement.innerHTML = strTime;
        }
        this.getNextTriggerTime();
        this.curTimer();
    }

    getNextTriggerTime() {
        var now = new Date();
        var estMiliTime = now.getTime() + (now.getTimezoneOffset() - 300) * 60000;
        var estTime = new Date(estMiliTime);
        var nHour = estTime.getHours();
        var nMin = estTime.getMinutes();
        var condMin = nHour * 60 + nMin;
        var strTrg = "";

        // console.log("[Bet.Component] EST Current Time ->", strDate, this.curTimePane);
        var trgTime = "";
        this.nextTriggerTime = "";
        this.nextMOCTime = "";
        var nextTrgTime = "";

        for(var i = 0; i < this.triggerData.length; i++) {
            var trgEstTime = new Date(this.triggerData[i]['Time']);

            // For only time compare..
            var trgHour = trgEstTime.getHours();
            var trgMin = trgEstTime.getMinutes();
            var trgCondMin = trgHour * 60 + trgMin;
            var trgYear = trgEstTime.getFullYear();
            var trgMonth = trgEstTime.getMonth() + 1;
            var trgDay = trgEstTime.getDate();

            if(nextTrgTime == "") {
                nextTrgTime = trgYear + "-" + trgMonth + "-" + trgDay;
            }

            // if(condMin < trgCondMin) {
                trgTime = this.triggerData[i]['Time'];
                if(this.nextMOCTime == "") {
                    this.nextMOCTime = "MOC " + trgYear + trgMonth + trgDay;
                }
                var trgObj = this.triggerData[i]['Data'];
                strTrg = "";
                for(var j = 0; j < trgObj.length; j++) {
                    var strOne = trgObj[j]['Group'] + ":" + trgObj[j]['Value'];
                    strTrg = strTrg + " " + strOne;
                }
                this.nextTriggerTime = this.nextTriggerTime + "<p> Next Trigger Time : " + trgTime + ", " + strTrg + "</p>";
            // }

            // For date compare..
            // if(estTime < trgEstTime) {
            //     trgTime = this.triggerData[i]['Time'];
            //     var trgObj = this.triggerData[i]['Data'];
            //     for(var j = 0; j < trgObj.length; j++) {
            //         var strOne = trgObj[j]['Group'] + ":" + trgObj[j]['Value'];
            //         strTrg = strTrg + " " + strOne;
            //     }
            //     this.nextTriggerTime = this.nextTriggerTime + "<p> Next Trigger Time : " + trgTime + ", " + strTrg + "</p>";
            // }
        }

        if(this.nextTriggerTime == "") {
            this.nextTriggerTime = "Next Trigger Time : " + nextTrgTime;
        }
        if(this.nextTriggerTimePane != undefined) {
            this.nextTriggerTimePane.nativeElement.innerHTML = this.nextTriggerTime;
        }
    }

    getImmediateTime(mcdate) {
        var mcyear = mcdate.substring(0, 4);
        var mcmonth = mcdate.substring(4, 6);
        var mcday = mcdate.substring(6);
        // console.log("[Bet.Component] Date ->", mcyear, mcmonth, mcday);

        var now = new Date();
        var estMiliTime = now.getTime() + (now.getTimezoneOffset() - 300) * 60000;
        var estTime = new Date(estMiliTime);
        var wkOfDay = estTime.getDay();
        var mYear = estTime.getFullYear();
        var mMonth = estTime.getMonth();
        var mDay = estTime.getDate();
        var nHour = estTime.getHours();
        var nMin = estTime.getMinutes();
        var condMin = nHour * 60 + nMin;

        // console.log("[Bet.Component] EST Current Time ->", mYear, mMonth, mDay, nHour, nMin, wkOfDay);

        var strDate = "Immediate";

        // if(mYear == mcyear && mMonth == mcmonth && mDay == mcday) {
        //     strDate = "Immediate";
        // } else {
            // var nPDay = 0;
            // if(condMin >= 17 * 60) {            
            //     if(wkOfDay == 0) { wkOfDay = 7; }
            //     wkOfDay ++;

            //     if(wkOfDay > 4 || wkOfDay == 0) {
            //         // Increasable day number..
            //         nPDay = (8 - wkOfDay);
            //     }
            // }

            // estMiliTime += nPDay * 3600 * 24000; 

            // var estTime = new Date(estMiliTime);
            // var nYear = estTime.getFullYear();
            // var nTemp = estTime.getMonth() + 1;
            // var nMonth = nTemp > 9 ? nTemp : '0' + nTemp;
            // var nTemp = estTime.getDate();
            // var nDay = nTemp > 9 ? nTemp : '0' + nTemp;


        //     strDate = 'MOC ' + nYear + nMonth + nDay;
        // }
        // console.log("[Bet.Component] Immediate Time ->", strDate);
        return strDate;
    }

    timeFromTimeStamp(timestamp) {
        // console.log("[Bet.Component] UTC Stamp to EST : ", timestamp);
        var now = new Date();
        var offset = now.getTimezoneOffset() - 300;
        var timeValue = parseInt(timestamp + offset * 60) * 1000;
        var estTime = new Date(timeValue);
        var mYear = estTime.getFullYear();
        var mMonth = estTime.getMonth() + 1;
        var mDay = estTime.getDate();
        var nHour = estTime.getHours() >= 10 ? estTime.getHours() : "0" + estTime.getHours();
        var nMin = estTime.getMinutes() >= 10 ? estTime.getMinutes() : "0" + estTime.getMinutes();
        var nSec = estTime.getSeconds() >= 10 ? estTime.getSeconds() : "0" + estTime.getSeconds();

        var strDate = mYear + "/" + mMonth + "/" + mDay + "  " + nHour + ":" + nMin + ":" + nSec + " EST";
        return strDate;
    }

    estTimeFromUTCStamp(timestamp) {
        var nowTime = new Date()
        // console.log("[Bet.Component] UTC Stamp to EST : ", timestamp);
        var timeValue = parseInt(timestamp) * 1000;
        var estTime = new Date(timeValue - 5 * 60);
        var mYear = estTime.getFullYear();
        var mMonth = estTime.getMonth() + 1;
        var mDay = estTime.getDate();
        var nHour = estTime.getHours() >= 10 ? estTime.getHours() : "0" + estTime.getHours();
        var nMin = estTime.getMinutes() >= 10 ? estTime.getMinutes() : "0" + estTime.getMinutes();
        var nSec = estTime.getSeconds() >= 10 ? estTime.getSeconds() : "0" + estTime.getSeconds();

        var strDate = mYear + "/" + mMonth + "/" + mDay + "  " + nHour + ":" + nMin + ":" + nSec + " EST";
        return strDate;
    }

    formatNumber(number, digit) {
        var step = 10;
        var strPrefix = "";
        for(var i = 1; i < digit; i++) {
            strPrefix += "0";
        }

        var strNumber = number + '';
        for(var i = 1; i < digit; i++) {
            if(number < step) {
                strNumber = strPrefix + number;
                break;
            } else {
                strPrefix = strPrefix.substring(1);
                step *= 10;
            }
        }

        return strNumber;
    }

    db_Selection = {};
    db_v4futures = {};
    db_v4mini = {};
    db_v4micro = {};
    db_componentloc = {};
    boxStylesMeta = [];

    condCellsAssoc = {
        "None": -1
    };

    createCondCellsAssoc() {
        var condCellsLen = this.componentDict.length;

        for(var i=0; i < condCellsLen; i++) {
            var curDict = this.componentDict[i];
            this.condCellsAssoc[curDict.webText] = curDict.id;    
        }
    }

    createShortToComponentAssoc() {
        for(var key in this.componentShorthands) {
            if(this.componentShorthands.hasOwnProperty(key)) {
                var value = this.componentShorthands[key]; 
                this.shortToComponentAssoc[value] = key;
            }
        }

    }

    /*------------------------- For Database ---------------------------------*/

    onConfirmPOSTNative() {

      var _this = this;
      var params = this.db_JSON_Stringify();
      var apiURL = this.baseURL + "/addrecord";

      var data = new FormData();
      data.append('user_id', JSON.stringify(params.user_id));
      data.append('Selection', JSON.stringify(params.Selection));
      data.append('boxstyles', JSON.stringify(params.boxstyles));
      data.append('componentloc', JSON.stringify(params.componentloc));

      this.busyF = this.betXHRService.postRequest(apiURL, data)
                    .then(function(response) {
                        _this.test_value2 = JSON.stringify(response);
                        _this.alarmDialog("Successfully saved and processed orders!", "OK");

                        //Refresh the recent data table at the bottom of the page...
                        _this.renderRecentTable(JSON.parse(response));    

                        console.log("[Bet.Componenet] Post Result Success : ", response);
                    })
                    .catch(function(err) {
                        switch(err.status) { 
                              case 404:  
                              case 500:  
                              case 0: 
                                  _this.alarmDialog("Error on confirm! Can't save it to the database!", "OK");
                                  _this.test_value2 = "Error Code : " + err.statusText;
                                  console.log("[Bet.Componenet] Post Result Error : ", err.statusText);                               
                                break;
                              default: 
                                break; 
                        }
                    });
      this.config2 = {
        'message': this.loadingMessages[1].immediate,
        'busy': this.busyF
      };                                    
    }

    db_JSON_Stringify() {

        // For post method..
        this.structData();
        
        var jsonData = {
            'user_id' : 32,
            'Selection' : this.db_Selection,
            'boxstyles' : [],
            'componentloc' : this.db_componentloc
        };

        return jsonData;
    }

    //Reset the order type label in the API params before invoking
    //Since we display the ordertype as MOC 20170130 as a default order type on clicking Clear All Bets
    //But we need to pass OrderType as "off" in these cases
    setOrderTypeBeforeAPI(dragAccountItem) {
        if(dragAccountItem.iOrderType === -1 && dragAccountItem.orderType === "MOC 20170130") {
            dragAccountItem.orderType = "Off"; 
        }
    }

    structData() {

        // For db_selection..
        var mic_account = this.dragAccounts[0];
        this.setOrderTypeBeforeAPI(mic_account);
        var mic_draggedPane = this.draggedBetJSON(mic_account.dragCol, mic_account.dragRow, mic_account.iNextBet, mic_account.iOrderType);
        
        var min_account = this.dragAccounts[1];
        this.setOrderTypeBeforeAPI(min_account);
        var min_draggedPane = this.draggedBetJSON(min_account.dragCol, min_account.dragRow, min_account.iNextBet, min_account.iOrderType);
        
        var fut_account = this.dragAccounts[2];
        this.setOrderTypeBeforeAPI(fut_account);
        var fut_draggedPane = this.draggedBetJSON(fut_account.dragCol, fut_account.dragRow, fut_account.iNextBet, fut_account.iOrderType);

        this.db_Selection = {
            'v4micro' : mic_draggedPane,
            'v4mini' : min_draggedPane,
            'v4futures' : fut_draggedPane,
        };
        console.log("[Bet.Component] db_Selection ->", JSON.stringify(this.db_Selection));

        // For db_v4micro..
        this.db_v4micro = this.draggedPaneJSON(0);
        console.log("[Bet.Component] db_v4futures ->", JSON.stringify(this.db_v4futures));


        // For db_v4mini..
        this.db_v4mini = this.draggedPaneJSON(0);

        // For db_v4futures..
        this.db_v4futures = this.draggedPaneJSON(0);

        this.test_value1 = JSON.stringify(this.db_Selection);
        this.test_value2 = JSON.stringify(this.db_v4futures);
    }

    // Get dragged down pane information..
    draggedBetJSON(col, row, nextBet, orderType) {
        var condID = -1;
        var jsonAry = [];
        var jsonBet = "";
        var jsonOrder = "";

        if(orderType == 1) {
            jsonOrder = "True";
        } else {
            jsonOrder = "False";
        }

        if(col < 0) {
            jsonAry = ["Off", jsonOrder];
            return jsonAry;
        } else if(col < 12) {
            // Set jsonBet data..
            if(nextBet == 0) {
                jsonBet = "" + (this.cols[col] - row);
            } else {
                jsonBet = "Anti-" + (this.cols[col] - row);
            }

            // Set jsonAry..
            jsonAry.push(jsonBet);
            jsonAry.push(jsonOrder);

            return jsonAry;
        } else {
            condID = this.condCells[col - 12][row].condID;
        }
        console.log("[Bet.Component] Cond ID ->", condID, col, row);

        if(condID == -1) {
            jsonBet = "Off";
        } else {
            if(nextBet == 0) {
                jsonBet = this.componentDict[condID].webText;
            } else {
                var antiCondID = condID - (condID % 2);
                jsonBet = this.componentDict[antiCondID].webText;
            }
        }

        jsonAry.push(jsonBet);
        jsonAry.push(jsonOrder);
        return jsonAry;
    }

    // Get pane information..
    draggedPaneJSON(userNum) {
        var paneJSON = {};
        var jsonKey = '';
        var jsonValue = [];

        for(var i = 0; i < this.cols.length; i++) {
            for(var j = this.col_items.length - 1; j >= 0; j--) {
                jsonKey = '' + (this.cols[i] - this.col_items[j]);
                jsonValue = [];
                var cond = "";
                var idx = 0;

                // Row condition 1..
                idx = j;
                // console.log("[Bet.Component] Col Index ->", idx);
                var rCondID1 = this.condCells[2][idx].condID;
                if(rCondID1 != -1) {
                    cond = this.componentDict[rCondID1].dictText;
                    jsonValue.push(cond);
                }

                // Row condition 2..
                var rCondID2 = this.condCells[3][idx].condID;
                if(rCondID2 != -1) {
                    cond = this.componentDict[rCondID2].dictText;
                    jsonValue.push(cond);
                }

                // Col condition..
                idx = Math.floor(i / 2);
                var cCondID = this.condCells[1][idx].condID;
                if(cCondID != -1) {
                    cond = this.componentDict[cCondID].dictText;
                    jsonValue.push(cond);
                }

                // Main condition..
                idx = i % 2;
                var mCondID = this.condCells[0][idx].condID;
                if(mCondID != -1) {
                    cond = this.componentDict[mCondID].dictText;
                    jsonValue.push(cond);
                }

                paneJSON[jsonKey] = jsonValue;
            1}
        }

        var data = [];
        data.push('None');
        paneJSON['Off'] = data;
        // For row condition..
        for(i = 0; i < this.condCells.length; i++) {
            for(var j = 0; j < this.condCells[i].length; j++) {
                jsonValue = [];
                var condID = this.condCells[i][j].condID;
                jsonKey = this.condCells[i][j].orgText;
                if(condID != -1) {
                    jsonValue.push(this.componentDict[condID].dictText);
                } else {
                    jsonValue.push("none");
                }

                paneJSON[jsonKey] = jsonValue;
            }
        }

        return paneJSON;
    }

    curComponentLoc() {
        var locDict = [];
        locDict.push({'c0':'Off'});
        var startPT = [0, 2, 8];
        for(var idx = 0; idx < this.condCells.length - 1; idx++) {
            for(var item = 0; item < this.condCells[idx].length; item++) {
                var obj = this.condCells[idx][item];
                var objLabel;
                if(idx < 2) {
                    objLabel = "c" + (startPT[idx] + item + 1);
                } else {
                    objLabel = "c" + (startPT[idx] + item * 2 + 1);
                }
                var objDict = {};
                objDict[objLabel] = this.components[obj.orgText][0];
                locDict.push(objDict);
                // console.log("[Bet.Component]1. Label, Text : ", objLabel, obj.text);

                if(idx == 2) {
                    objLabel = "c" + (startPT[idx] + item * 2 + 2);
                    obj = this.condCells[idx + 1][item];
                    var objDict = {};
                    objDict[objLabel] = this.components[obj.orgText][0];
                    locDict.push(objDict);
                    // console.log("[Bet.Component]2. Label, Text : ", objLabel, obj.text);
                }
            }
        }

        return locDict;
    }

    /*------------------------- For retriving data from server ---------------------------------*/
    getPreviousBettingInfo() {
        var body =   this.baseURL + '/getrecords';

        console.log("[Bet.Component] Previous Bet HTTP : ", body);


        this.busyA = this.http.get(body).subscribe(response => {
            var jsonData = response.json() || {};
            console.log("[Bet.Componenet] GET Betting Result Success : ", jsonData);
            this.parseBetInfo(jsonData);
        }, error => {
            this.alarmDialog("Error on loading betting data!", "OK");
            this.test_value2 = "Error Code : " + error;
            console.log("[Bet.Componenet] GET Betting Result Error : ", error);
        });
    }

    getMetaDataInfo() {
        var body =   this.baseURL + '/getmetadata';

        console.log("[Bet.Component] Previous Meta Data HTTP : ", body);

        this.busyB = this.http.get(body).subscribe(response => {
            var jsonData = response.json() || {};
            console.log("[Bet.Componenet] GET Meta Data Result Success : ", jsonData);
            this.setTriggerData(jsonData);
        }, error => {
            this.alarmDialog("Error on loading meta data data!","OK");
            this.test_value2 = "Error Code : " + error;
            console.log("[Bet.Componenet] GET Meta Data Result Error : ", error);
        });
    }

    getAccountDataInfo() {
        var body =   this.baseURL + '/getaccountdata';

        console.log("[Bet.Component] Previous Account Data HTTP : ", body);

        this.busyC = this.http.get(body).subscribe(response => {
            var jsonData = response.json() || {};
            console.log("[Bet.Componenet] GET Account Result Success : ", jsonData);
            this.parseAccountData(jsonData);
        }, error => {
            this.alarmDialog("Error on loading account data!", "OK");
            this.test_value2 = "Error Code : " + error;
            console.log("[Bet.Componenet] GET Account Result Error : ", error);
        });
    }

    getTimeTableInfo() {
        var body =   this.baseURL + '/gettimetable';

        console.log("[Bet.Component] Previous Time Table HTTP : ", body);

        this.busyD = this.http.get(body).subscribe(response => {
            var jsonData = response.json() || {};
            console.log("[Bet.Componenet] GET TIme Table Success : ", jsonData);
            this.parseTimeTableData(jsonData);
        }, error => {
            this.alarmDialog("Error on loading time table data!", "OK");
            this.test_value2 = "Error Code : " + error;
            console.log("[Bet.Componenet] GET Time Table Result Error : ", error);
        });
    }

    getUnrealizedPNLDataInfo() {
        var body =   this.baseURL + '/getstatus';

        console.log("[Bet.Component] Previous Unrealized PNL HTTP : ", body);

        this.busyE = this.http.get(body).subscribe(response => {
            var jsonData = response.json() || {};
            console.log("[Bet.Componenet] GET Unrealized PNL Success : ", jsonData);
            this.parseUnrealizedPNLData(jsonData);
        }, error => {
            this.alarmDialog("Error on loading Unrealized PNL data!", "OK");
            this.test_value2 = "Error Code : " + error;
            console.log("[Bet.Componenet] GET Unrealized PNL Result Error : ", error);
        });
    }

    parseBetInfo(jsData) {

        // For living..
        // For previous data loading..
        var previous = jsData['first'];
        var mcdate = previous['mcdate'] || "Off";

        this.customBoardStylesMeta = this.listToObjectPipe.transform(previous.customstyles);
        var boxStyles = previous['boxstyles'];
        this.boxStylesDict = this.listToObjectPipe.transform(boxStyles);

        if(this.customBoardStylesMeta['list_loadingscreens']) {
            this.loadingMessages = this.customBoardStylesMeta['list_loadingscreens'];
        }

        this.config1.message = this.loadingMessages[2]['else'];

        // For db_componentloc..
        this.db_componentloc = JSON.parse(previous['componentloc']);

        this.mapComponentsToTable();

        this.renderRecentTable(jsData);    

        console.log("[Bet.Component] Box Style Parsed Data:", boxStyles);
        this.applyStyle(boxStyles);

        this.boxStylesMeta = boxStyles;

        var performanceCharts = previous['performance'];
        console.log("[Bet.Component] Performance Style Parsed Data:", performanceCharts);
        this.getPerformanceData(performanceCharts);

        var item : any;
        var Selection = JSON.parse(previous['selection']);
        item = Selection['v4micro'];    this.layoutBet(item, 0, mcdate);
        item = Selection['v4mini'];     this.layoutBet(item, 1, mcdate);
        item = Selection['v4futures'];  this.layoutBet(item, 2, mcdate);
    }

    mapComponentsToTable() {

        var componentsLen = this.db_componentloc.length;

        this.componentsPosMap = {};

        for(var i=1; i < componentsLen; i++) {
            var curCompMeta =   this.boxStylesDict['c' + i];
            var componentName = curCompMeta['text'];

            if(componentName !== '') {
                componentName = this.shortToComponentAssoc[componentName];
                this.componentsPosMap[componentName] = i;
            }
        }

        var compDictLen = this.componentDict.length;

        //Update component dict
        for(var i=0; i < compDictLen; i++) {
            var curComp = this.componentDict[i];

            var compName = curComp.webText;

            var compPos = this.componentsPosMap[compName];
            var compRelativePos = (compPos !== null && compPos !== undefined) ? this.compIdToPosMap[compPos] :  -1;

            curComp['condRelative'] = compRelativePos;
        }

    }

    renderRecentTable(jsData) {

        this.bShowRecentData = false;
        this.recentData = [];

        // For recent data loading..
        var tempData = jsData['recent'];
        for(var i = 0; i < tempData.length; i++) {
            console.log("[Bet.Component] TimeStamp of recent:", tempData[i].timestamp);
            var oneData : any = {
                'timestamp' : this.timeFromTimeStamp(tempData[i].timestamp) || 0,
                'mcdate' : tempData[i].mcdate || "",
                'selection' : this.getParsedSelectionData(JSON.parse(tempData[i].selection))
            }

            this.recentData.push(oneData);
        }

        var selectionItemLen = this.recentData[0].selection.length;

        this.recentDataDynamicHeaders = this.generateRecentDataDynamicHeaders(selectionItemLen);
        
        this.dynamicColumnWidth = 60/(selectionItemLen * 3);
        this.bShowRecentData = true;
    }

    getParsedSelectionData(selectionObj) {
        var selectionAry = [];

        for(var key in selectionObj) {
            var metaAry = this.getTransformedMetaAry(selectionObj[key]);
            var selectionItem = {
                "items": [key].concat(metaAry)
            }

            selectionAry.push(selectionItem);
        }

        return selectionAry;
    }

    getTransformedMetaAry(metaAry) {
        var orderTypeAssoc = {
            "True": "Immediate",
            "False": "MOC"
        }

        var orderType = orderTypeAssoc[metaAry[metaAry.length - 1]];

        metaAry[metaAry.length - 1] = orderType;

        return metaAry;
    }

    generateRecentDataDynamicHeaders(itemLen) {
        var dynamicHeadersAry = [];

        for(var i=0; i < itemLen; i++) {
            var dynamicHeaderItem = {
                    "items": ["Account", "Bet", "Ordertype"]
            }

            dynamicHeadersAry.push(dynamicHeaderItem);
        }

        return dynamicHeadersAry;
    }

    layoutBet(item, dragItem, mcdate) {
        console.log("[Bet.Component] Drag Item : ", item, dragItem);
        var component = item[0];        // component info..
        var orderType = item[1];        // order type info..
        var idCol = -1, idRow = -1;     // position info..

        var dragObj = this.dragAccounts[dragItem];
        dragObj.display = "none";

        dragObj.nextBet = component;

        // For simple layout..
        if(component == "Off") {                            // put bet on off panel..
            dragObj.iNextBet = -1;
            dragObj.display = "table-cell";
        } else if(component.indexOf('Anti') != -1) {        // put as a anti object..
            var betVal = component.substring(4);
            if(betVal.length < 4) {                 // put it on bet table..
                betVal = betVal.substring(1);
                this.putBetOnTable(betVal, dragObj, dragItem);
            } else {                                // put it on condition panel..
                this.putBetOnCond(component, dragObj, dragItem, 1);
                dragObj.iNextBet = 0;
            }
        } else {                                            // put as a normal object..
            if(component.length < 3) {              // put it on bet table..
                dragObj.iNextBet = 0;
                this.putBetOnTable(component, dragObj, dragItem);
            } else {                                // put it on condition panel..
                this.putBetOnCond(component, dragObj, dragItem, 1);
            }
        }

        if(orderType == "True") {
            dragObj.orderType = this.getImmediateTime(mcdate);
            dragObj.iOrderType = 1;
        } else {
            dragObj.orderType = "MOC " + mcdate;
            dragObj.iOrderType = 0;
        }
    }

    putBetOnTable (betVal, dragObj, dragItem) {
        var idCol = Math.floor((betVal - 1) / 3);
        var idRow = 2 - ((betVal - 1) % 3);
        // console.log("[Bet.Component] Previous Item Cell For Table : ", betVal, idCol, idRow);
        dragObj.dragCol = idCol; dragObj.dragRow = idRow;
        var dragQueue = this.betCells[idCol][idRow];

        //Get the cell meta object where the betting chips is to be placed...
        var tableCell = this.tableCells[idCol * 3 + ( 2 - idRow )];

        //If it is not empty cell then fill it with corresponding metadata..
        if(tableCell && tableCell['text'] !== '') {
            
            for(var i = 0; i < dragQueue.length; i++) {
                if(dragQueue[i] == -1) {
                    dragQueue[i] = dragItem;
                    break;
                }
            }

            dragObj.dragOrder = i;

        } else {
            //If the chip position is non-existent, then move it to Off by default...
            dragObj.dragCol = -1;
            dragObj.dragRow = -1;
            dragObj.display = 'table-cell';
            dragObj.dragOrder = -1;
            dragObj.nextBet = "Off";
            dragObj.iNextBet = -1;

            this.dragAccounts[dragItem]['nextBet'] = "Off";
        }
    }

    putBetOnCond (component, dragObj, dragItem, revert) {
        // Get condition of that component..
        var selCond = -1;
        for(var i = 0; i < this.componentDict.length; i++) {
            if(this.componentDict[i].webText == component) {
                selCond = i;
                break;
            }
        }    

        // Get layout information of condition and layout bet to that cell..
        if(selCond != -1) {
            var condItem = this.componentDict[selCond];
            var inverSel = selCond % 2 == 0? selCond + 1 : selCond - 1;
            var rowID = condItem.condRelative % 10;
            var colID = Math.floor(condItem.condRelative / 10);

            console.log("[Bet.Component] Previous Item Cell For Cond : ", condItem, colID, rowID);
            
            var dragItemQueue:any;
            
            if(colID != -1 && rowID != -1 && condItem.condRelative !== -1) {
                dragObj.dragCol = 12 + colID; dragObj.dragRow = rowID;
                dragItemQueue = this.condCells[colID][rowID].dragItem;

                for(var i = 0; i < dragItemQueue.length; i++) {
                    if(dragItemQueue[i] == -1) {
                        dragItemQueue[i] = dragItem;
                        break;
                    }
                }
                dragObj.dragOrder = i;

            } else {
                
                //If the chip position is non-existent, then move it to Off by default...
                dragObj.dragCol = -1;
                dragObj.dragRow = -1;
                dragItemQueue = [];
                dragObj.display = 'table-cell';
                dragObj.dragOrder = -1;
                dragObj.nextBet = "Off";
                dragObj.iNextBet = -1;

                this.dragAccounts[dragItem]['nextBet'] = "Off";
            }
        }
    }

    setTriggerData(rowData) {

        // // For testing..
        // var rowData1 = "{\"timestamp\": 1481807880, \"mcdate\": \"20161215\", \"components\": \"{'Anti-Seasonality': ['AntiSEA'], 'Off': ['None'], 'RiskOff': ['RiskOff'], '50/50': ['0.75LastSIG'], 'Custom': ['Custom'], 'Anti50/50': ['Anti0.75LastSIG'], 'LowestEquity': ['0.5LastSIG'], 'AntiHighestEquity': ['Anti1LastSIG'], 'Anti-Custom': ['AntiCustom'], 'Seasonality': ['LastSEA'], 'RiskOn': ['RiskOn'], 'Anti-Previous': ['AntiPrevACT'], 'HighestEquity': ['1LastSIG'], 'AntiLowestEquity': ['Anti0.5LastSIG'], 'Previous': ['prevACT']}\", \"triggers\": \"{u'EMD': {'Date': '20161215', 'Group': u'index', 'Triggertime': u'2016-12-15 16:30'}, u'YM': {'Date': '20161215', 'Group': u'index', 'Triggertime': u'2016-12-15 16:30'}, u'HO': {'Date': '20161215', 'Group': u'energy', 'Triggertime': u'2016-12-15 16:30'}, u'GBP': {'Date': '20161215', 'Group': u'currency', 'Triggertime': u'2016-12-15 16:30'}, u'HG': {'Date': '20161215', 'Group': u'metal', 'Triggertime': u'2016-12-15 16:30'}, u'HE': {'Date': '20161215', 'Group': u'meat', 'Triggertime': u'2016-12-15 13:55'}, u'LE': {'Date': '20161215', 'Group': u'meat', 'Triggertime': u'2016-12-15 13:55'}, u'ZS': {'Date': '20161215', 'Group': u'grain', 'Triggertime': u'2016-12-15 14:05'}, u'NG': {'Date': '20161215', 'Group': u'energy', 'Triggertime': u'2016-12-15 16:30'}, u'PA': {'Date': '20161215', 'Group': u'metal', 'Triggertime': u'2016-12-15 16:30'}, u'RB': {'Date': '20161215', 'Group': u'energy', 'Triggertime': u'2016-12-15 16:30'}, u'NQ': {'Date': '20161215', 'Group': u'index', 'Triggertime': u'2016-12-15 16:30'}, u'CAD': {'Date': '20161215', 'Group': u'currency', 'Triggertime': u'2016-12-15 16:30'}, u'PL': {'Date': '20161215', 'Group': u'metal', 'Triggertime': u'2016-12-15 16:30'}, u'ZL': {'Date': '20161215', 'Group': u'grain', 'Triggertime': u'2016-12-15 14:05'}, u'ZM': {'Date': '20161215', 'Group': u'grain', 'Triggertime': u'2016-12-15 14:05'}, u'ZN': {'Date': '20161215', 'Group': u'debt', 'Triggertime': u'2016-12-15 16:30'}, u'AUD': {'Date': '20161215', 'Group': u'currency', 'Triggertime': u'2016-12-15 16:30'}, u'CHF': {'Date': '20161215', 'Group': u'currency', 'Triggertime': u'2016-12-15 16:30'}, u'CL': {'Date': '20161215', 'Group': u'energy', 'Triggertime': u'2016-12-15 16:30'}, u'ZF': {'Date': '20161215', 'Group': u'debt', 'Triggertime': u'2016-12-15 16:30'}, u'ZB': {'Date': '20161215', 'Group': u'debt', 'Triggertime': u'2016-12-15 16:30'}, u'ZC': {'Date': '20161215', 'Group': u'grain', 'Triggertime': u'2016-12-15 14:05'}, u'GF': {'Date': '20161215', 'Group': u'meat', 'Triggertime': u'2016-12-15 13:55'}, u'GC': {'Date': '20161215', 'Group': u'metal', 'Triggertime': u'2016-12-15 16:30'}, u'NZD': {'Date': '20161215', 'Group': u'currency', 'Triggertime': u'2016-12-15 16:30'}, u'ZT': {'Date': '20161215', 'Group': u'debt', 'Triggertime': u'2016-12-15 16:30'}, u'ZW': {'Date': '20161215', 'Group': u'grain', 'Triggertime': u'2016-12-15 14:05'}, u'ES': {'Date': '20161215', 'Group': u'index', 'Triggertime': u'2016-12-15 16:30'}, u'EUR': {'Date': '20161215', 'Group': u'currency', 'Triggertime': u'2016-12-15 16:30'}, u'MXP': {'Date': '20161215', 'Group': u'currency', 'Triggertime': u'2016-12-15 16:30'}, u'JPY': {'Date': '20161215', 'Group': u'currency', 'Triggertime': u'2016-12-15 16:30'}, u'SI': {'Date': '20161215', 'Group': u'metal', 'Triggertime': u'2016-12-15 16:30'}, u'NIY': {'Date': '20161215', 'Group': u'index', 'Triggertime': u'2016-12-15 16:30'}}\"}";
        
        // rowData1 = rowData1.replace(/\{u'/g, "\{'");
        // rowData1 = rowData1.replace(/\,u'/g, "\,'");
        // rowData1 = rowData1.replace(/ u'/g, " '");
        // // console.log("[Bet.Component] Trigger Data Row Data : ", rowData1);

        // var mdata = JSON.parse(rowData1);
        // // console.log("[Bet.Component] Trigger Data Parsed Mid Data : ", mdata);

        // var jdata = mdata['triggers'];
        // jdata = jdata.replace(/'/g, "\"");
        // // console.log("[Bet.Component] Trigger Data Before JSON Data : ", jdata);
        // var json = JSON.parse(jdata);
        // // console.log("[Bet.Component] Trigger Data JSON Object : ", json);



        // For living..
        console.log("[Bet.Component] Trigger Data Row Data : ", rowData);
        var jdata = rowData['triggers'];
        var json = jdata;

        if(typeof jdata === "string") {
            jdata = jdata.replace(/\{u'/g, "\{'");
            jdata = jdata.replace(/\,u'/g, "\,'");
            jdata = jdata.replace(/ u'/g, " '");
            jdata = jdata.replace(/'/g, "\"");

            console.log("[Bet.Component] Trigger Data Before JSON Data : ", jdata);
            json = JSON.parse(jdata);
        } 
        
        console.log("[Bet.Component] Trigger Data JSON Object : ", json);

        this.anticomponents = rowData['anticomponents'];
        this.components = rowData['components'];

        // Get all data..
        var jsonArray = [];
        var jsonKeys = Object.keys(json);
        for(var i = 0; i < jsonKeys.length; i++) {
            jsonArray.push([jsonKeys[i], json[jsonKeys[i]]]);
        }

        // Sort it by trigger time..
        jsonArray.sort(function(a, b)
            {
                var data1:any = a[1]['Triggertime'];
                var data2:any = b[1]['Triggertime'];
                var result1 = data1.localeCompare(data2);
                if(result1 != 0) {
                    return result1;
                }

                var data3:any = a[1]['Group'];
                var data4:any = b[1]['Group'];
                return data3.localeCompare(data4);
            }
        );

        // Reconstruct for usable data structure..
        var triggerTime = "";
        var triggerKey = "";
        var triggerString = "";
        var oneTriggerData = {};
        var oneData = {};
        var bChange = false;
        for(i = 0; i < jsonArray.length; i++) {
            var jsonObj = jsonArray[i];

            if(triggerTime != jsonObj[1]['Triggertime']) {
                bChange = true;
            }
            
            if(triggerKey != jsonObj[1]['Group'] || bChange) {
                // Push data to the trigger data..
                if(triggerString != "") {
                    triggerString = triggerString.substring(0, triggerString.length - 2);
                    oneData['Value'] = triggerString;
                    // console.log("[Bet.Component] Trigger Data Column ->", oneData);
                    oneTriggerData['Data'].push(oneData);
                };

                // Reset key and string for new..
                triggerKey = jsonObj[1]['Group'];
                triggerString = "";
                oneData = {
                    'Group' : triggerKey,
                    'Value' : "",
                };

                if(bChange) {
                    // Push data to the trigger queue..
                    // console.log("[Bet.Component] Trigger Data ->", oneTriggerData);
                    if(triggerTime != "") {
                        this.triggerData.push(oneTriggerData);
                    }

                    // Reset all for new..
                    triggerTime = jsonObj[1]['Triggertime'];
                    oneTriggerData = {
                        'Time' : triggerTime,
                        'Data' : []
                    };
                }
                bChange = false;
            }

            var triggerValue = jsonObj[0];
            triggerString += triggerValue + ", ";
            // console.log("[Bet.Component] Trigger String ->", triggerString);
        }

        if(triggerString != '') {
            triggerString = triggerString.substring(0, triggerString.length - 2);
            oneData['Value'] = triggerString;
            oneTriggerData['Data'].push(oneData);
            this.triggerData.push(oneTriggerData);
        }
        // console.log("[Bet.Component] Total Arranged Trigger Data ->", this.triggerData);
    }

    parseAccountData(rowData) {
        // // For testing..
        // var rowData1 = "{\"timestamp\": 1481807880, \"mcdate\": \"20161215\", \"value2\": \"{'v4micro': {'col1value': 51447, 'col2title': 'Timestamp', 'col2value': '2016-12-25 12:49:43 AM', 'col1title': 'Account Value'}, 'v4mini': {'col1value': 109655, 'col2title': 'Timestamp', 'col2value': '2016-12-25 12:40:56 AM', 'col1title': 'Account Value'}, 'v4futures': {'col1value': 242863, 'col2title': 'Timestamp', 'col2value': '2016-12-25 04:13:22 AM', 'col1title': 'Account Value'}}\", \"value1\": \"{'v4micro': {'col1value': -5821, 'col2title': 'Timestamp', 'col2value': '2016-12-25 12:49:43 AM', 'col1title': 'UnrealizedPnL'}, 'v4mini': {'col1value': -4165, 'col2title': 'Timestamp', 'col2value': '2016-12-25 12:40:56 AM', 'col1title': 'UnrealizedPnL'}, 'v4futures': {'col1value': -955, 'col2title': 'Timestamp', 'col2value': '2016-12-25 04:13:22 AM', 'col1title': 'UnrealizedPnL'}}\"}";
        // rowData1 = rowData1.replace(/\{u'/g, "\{'");
        // rowData1 = rowData1.replace(/\,u'/g, "\,'");
        // rowData1 = rowData1.replace(/ u'/g, " '");
        // // console.log("[Bet.Component] Account Data Row Data : ", rowData1);

        // var mdata = JSON.parse(rowData1);
        // // console.log("[Bet.Component] Account Data Parsed Mid Data : ", mdata);
        // var val1data = mdata['value1'];
        // var val2data = mdata['value2'];
        // val1data = val1data.replace(/'/g, "\"");
        // val2data = val2data.replace(/'/g, "\"");
        
        // var jsonData1 = JSON.parse(val1data);
        // var jsonData2 = JSON.parse(val2data);
        // console.log("[Bet.Component] Account Data Value1 JSON Object : ", jsonData1);
        // console.log("[Bet.Component] Account Data Value2 JSON Object : ", jsonData2);
        


        // For living..
        console.log("[Bet.Component] Account Data Row Data : ", rowData);

        var val1data = rowData['value1'];
        var val2data = rowData['value2'];
        
        val1data = val1data.replace(/\{u'/g, "\{'");
        val1data = val1data.replace(/\,u'/g, "\,'");
        val1data = val1data.replace(/ u'/g, " '");
        val1data = val1data.replace(/'/g, "\"");
        console.log("[Bet.Component] Account Data Value1 Before JSON Data : ", val1data);
        val2data = val2data.replace(/\{u'/g, "\{'");
        val2data = val2data.replace(/\,u'/g, "\,'");
        val2data = val2data.replace(/ u'/g, " '");
        val2data = val2data.replace(/'/g, "\"");
        console.log("[Bet.Component] Account Data Value2 Before JSON Data : ", val2data);
        
        var jsonData1 = JSON.parse(val1data);
        var jsonData2 = JSON.parse(val2data);
        console.log("[Bet.Component] Account Data Value1 JSON Object : ", jsonData1);
        console.log("[Bet.Component] Account Data Value2 JSON Object : ", jsonData2);
        


        var objKeys = ['v4micro', 'v4mini', 'v4futures'];

        // For UnrealizedPnL..
        for(var i = 0; i < 3; i++) {
            var jsonObj = jsonData1[objKeys[i]];
            var col1Key = jsonObj['col1title'];
            var col1Val = jsonObj['col1value'];
            // var col2Key = jsonObj['col2title'];
            // var col2Val = jsonObj[col2Key];

            this.accountTableColumn1 = col1Key;
            if(col1Val > 0) {
                this.dragAccounts[i].column1Clr = "green";
                this.dragAccounts[i].column1 = "$ " + this.numberWithCommas(col1Val);
            } else {
                this.dragAccounts[i].column1Clr = "red";
                this.dragAccounts[i].column1 = "$ (" + this.numberWithCommas(Math.abs(col1Val)) + ")";
            }
        }

        // For Account Value..
        for(var i = 0; i < 3; i++) {
            var jsonObj = jsonData2[objKeys[i]];
            var col1Key = jsonObj['col1title'];
            var col1Val = jsonObj['col1value'];
            var col2Key = jsonObj['col2title'];
            var col2Val = jsonObj['col2value'];
            this.accountTableColumn2 = col1Key;
            this.dragAccounts[i].column2 = "$ " + this.numberWithCommas(col1Val);;
            this.dragAccounts[i].lastUpdate = col2Val;
        }
    }

    parseTimeTableData(rowData) { 

        if(rowData) {
            this.chartInfo4.chartData = rowData;    
        }
    }

    parseUnrealizedPNLData(rowData) {

        if(rowData) {
            this.chartInfo3.tabsList = this.returnTabsListObject(rowData[this.chartInfo3.tabKeys[0]]['tab_list']);

            this.chartInfo3.chartData = rowData;    
        }        
    }

    returnTabsListObject(tabList) {
        var tabsList = [];
        for(var i=0; i < tabList.length; i++) {
            var tab = {};
            tab['id'] = i;
            tab['name'] = tabList[i];
            tabsList.push(tab);
        }

        return tabsList;
    }

    numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    applyStyle(boxStyles) {

        // For off pane..
        var offStyle = this.boxStylesDict["c0"];
        this.offCell.bgColor = "#" + offStyle["fill-Hex"];
        this.offCell.text = offStyle["text"];
        this.offCell.color = "#" + offStyle["text-color"];
        this.offCell.font = offStyle["text-font"];
        this.offCell.size = offStyle["text-size"];
        this.offCell.style = offStyle["text-style"];

        // For Conditions..
        var idc = 1;
        for(var idx = 0; idx < this.condCells.length; idx++) {
            for(var ids = 0; ids < this.condCells[idx].length; ids++) {
                var idR = idx;
                var idK = ids;
                var key = "c" + idc;
                if(idR == 2) {
                    idR = idK % 2 + 2;
                    idK = Math.floor(idK / 2);
                } else if(idR == 3) {
                    idR = (idK + 1) % 2 + 2;
                    idK = Math.floor((idK + 1) / 2) + 1;
                }
                var style = this.boxStylesDict[key];

                if(style) {

                    var textcolor = this.returnTextColorRelativeToBackground.transform("#" + style["fill-Hex"]);
                    var compText = (style["text"] !== '') ? style["text"] : "None";
                    
                    console.log("[Bet.Component] R, C : ", idR, idK);
                    
                    this.condCells[idR][idK].bgColor = "#" + style["fill-Hex"];
                    this.condCells[idR][idK].text = style["text"];
                    this.condCells[idR][idK].color = textcolor;
                    this.condCells[idR][idK].font = style["text-font"];
                    this.condCells[idR][idK].tsize = style["text-size"];
                    this.condCells[idR][idK].tstyle = style["text-style"];
                    var compName = this.shortToComponentAssoc[compText];
                    var condID = this.condCellsAssoc[compName];
                    condID = (condID !== undefined) ? condID : -1;
                    this.condCells[idR][idK].condID = condID;

                    console.log("[Bet.Component] condCells Cell, Style, Key : ", this.condCells[idx][ids], style, key, idc);

                }
                
                idc++;
            }
        }

        // For Buttons..
        for(var idx = 0; idx < this.buttonCells.length; idx++) {
            var key = this.buttonCells[idx]["relative"];
            var style = this.boxStylesDict[key];

            if(style) {
                this.buttonCells[idx].bgColor = "#" + style["fill-Hex"];
                this.buttonCells[idx].text = style["text"];
                this.buttonCells[idx].color = "#" + style["text-color"];
                this.buttonCells[idx].font = style["text-font"];
                this.buttonCells[idx].tsize = style["text-size"];
                this.buttonCells[idx].tstyle = style["text-style"];
                console.log("[Bet.Component] buttonCells Cell, Style, Key : ", this.buttonCells[idx], style, key);
            }

        }

        // For Table formats of text and title..
        for(var idx = 0; idx < this.tableStyles.length; idx++) {
            var key = this.tableStyles[idx]["relative"];
            var style = this.boxStylesDict[key];

            if(style) {
                this.tableStyles[idx].color = "#" + style["text-color"];
                this.tableStyles[idx].font = style["text-font"];
                this.tableStyles[idx].size = style["text-size"];
                this.tableStyles[idx].style = style["text-style"];
                console.log("[Bet.Component] tableStyles Cell, Style, Key : ", this.tableStyles[idx], style, key);
            }

        }

        // For Time formats..
        for(var idx = 0; idx < this.timeStyles.length; idx++) {
            var key = this.timeStyles[idx]["relative"];
            var style = this.boxStylesDict[key];

            if(style) {
                this.timeStyles[idx].color = "#" + style["text-color"];
                this.timeStyles[idx].font = style["text-font"];
                this.timeStyles[idx].size = style["text-size"];
                this.timeStyles[idx].style = style["text-style"];
                console.log("[Bet.Component] timeStyles Cell, Style, Key : ", this.timeStyles[idx], style, key);
            }

        }

        // For Table cell formats..
        for(var idx = 0; idx < this.tableCells.length; idx++) {
            var key = this.tableCells[idx]["id"] + "";
            var style = this.boxStylesDict[key];

            if(style) {
                this.tableCells[idx].bgColor = "#" + style["fill-Hex"];
                this.tableCells[idx].text = style["text"];
                this.tableCells[idx].color = "#" + style["text-color"];
                this.tableCells[idx].font = style["text-font"];
                this.tableCells[idx].size = style["text-size"];
                this.tableCells[idx].style = style["text-style"];
                console.log("[Bet.Component] tableCells Cell, Style, Key : ", this.tableCells[idx], style, key);
            }

        }

        // For Chip cell formats..
        for(var idx = 0; idx < this.chipStyles.length; idx++) {
            var key = this.chipStyles[idx]["relative"];
            var style = this.boxStylesDict[key];

            if(style) {
                this.chipStyles[idx].text = style["text"];
                this.chipStyles[idx].color = style["text-color"];
                this.chipStyles[idx].img = style["filename"];
                this.dragAccounts[idx].text = style["text"];
                this.dragAccounts[idx].bg_url = this.chipStyles[idx].img; 
                console.log("[Bet.Component] chipStyles Cell, Style, Key : ", this.chipStyles[idx], style, key);
            }

        }

        // For dialog cell formats..
        for(var idx = 0; idx < this.dlgStyles.length; idx++) {
            var key = this.dlgStyles[idx]["relative"];
            var style = this.boxStylesDict[key];

            if(style) {
                this.dlgStyles[idx].bgColor = "#" + style["fill-Hex"];
                this.dlgStyles[idx].text = style["text"];
                this.dlgStyles[idx].color = "#" + style["text-color"];
                this.dlgStyles[idx].font = style["text-font"];
                this.dlgStyles[idx].size = style["text-size"];
                this.dlgStyles[idx].style = style["text-style"];
                console.log("[Bet.Component] Cell, Style, Key : ", this.dlgStyles[idx], style, key);
            }
        }


        // For chart information dialog formats..
        for(var idx = 0; idx < this.chartStyle.length; idx++) {
            var key = this.chartStyle[idx]["relative"];
            var style = this.boxStylesDict[key];

            if(style) {
                this.chartStyle[idx].color = "#" + style["text-color"];
                this.chartStyle[idx].font = style["text-font"];
                this.chartStyle[idx].size = style["text-size"];
                this.chartStyle[idx].style = style["text-style"];
                console.log("[Bet.Component] Cell, Style, Key : ", this.chartStyle[idx], style, key);
            }

        }

        var titleTextMeta = this.boxStylesDict[this.chartInfo4['styleKey']];

        this.chartInfo4['titleText'] = (titleTextMeta) ? titleTextMeta['text'] : "Immediate Orders";

    }

    /*------------------------- For chart purpose ---------------------------------*/
    getPerformanceData(performanceCharts) {

        // Read Account Value performance data..
        var actValueJSON = performanceCharts['account_value'];
        var actValueData = {};

        actValueData['0'] = actValueJSON['v4micro_filename'];
        actValueData['1'] = actValueJSON['v4mini_filename'];
        actValueData['2'] = actValueJSON['v4futures_filename'];

        actValueData['0_infotext'] = actValueJSON['v4micro_infotext'];
        actValueData['1_infotext'] = actValueJSON['v4mini_infotext'];
        actValueData['2_infotext'] = actValueJSON['v4futures_infotext'];
        
        this.chartData['actValue'] = actValueData;

        // Read tabel Value performance data..
        for(var i = 0; i < 36; i++) {
            var tableValueJSON = performanceCharts[(i + 1) + ''];
            var tableValueData = {};

            // Data for performance chart..
            tableValueData['perText'] = tableValueJSON['infotext'];
            
            tableValueData['0_per_file'] = tableValueJSON['v4futures_filename'];
            tableValueData['1_per_file'] = tableValueJSON['v4mini_filename'];
            tableValueData['2_per_file'] = tableValueJSON['v4micro_filename'];

            // Data for rank chart..
            tableValueData['0_rank_text'] = tableValueJSON['v4futures_rank_text'];
            tableValueData['0_rank_file'] = tableValueJSON['v4futures_rank_filename'];
            tableValueData['1_rank_text'] = tableValueJSON['v4mini_rank_text'];
            tableValueData['1_rank_file'] = tableValueJSON['v4mini_rank_filename'];
            tableValueData['2_rank_text'] = tableValueJSON['v4micro_rank_text'];
            tableValueData['2_rank_file'] = tableValueJSON['v4micro_rank_filename'];

            // Data for info tab..
            tableValueData['dateText'] = tableValueJSON['date'];
            tableValueData['infoText'] = tableValueJSON['infotext2'];
            tableValueData['signals'] = tableValueJSON['signals'];
            this.chartData[(i + 1) + ''] = tableValueData;
        }

        // Read Condition Value performance data..
        for(var i = 0; i < this.componentDict.length; i++) {
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
            this.chartData[dictCell.webText] = condValueData;
        }

        console.log("[Bet.Component] Performance Chart Data : ", this.chartData);
    }

	adjustChartPanePosition() {
        var containerW = window.innerWidth;
        var marginLeft = (containerW - 720)/2;

        this.chartInfo1[0].marginLeft  = marginLeft;
    }

    performanceChart(type, subType) {
        
        //Hiding all the other charts before showing the current selected dialogue
        this.hideChartDialogues();

        console.log("[Bet.Component] Table Type, SubType -> ", type, subType);
		
		//this.adjustChartPanePosition();		

        if(type == 0) {                 // For Unrealized PNL value chart..

            this.handlePNLTabs(0, subType);
            this.isChartBox3 = true;

        } else if(type == 1) {                 // For Immediate Orders chart..
            
            this.handleImmediateOrderTabs(0);
            this.isChartBox4 = true;
        
        } else if(type == 2) {          // For Account value chart..
            this.chartInfo1[0].chipText = this.dragAccounts[subType].text;
            this.chartInfo1[0].chipImg = this.dragAccounts[subType].bg_url;
            this.chartInfo1[0].chartTitle = "Account Performance Chart";
            this.curBetPerformance = subType + "";
            this.chartInfo1[0].chartURL = this.chartData['actValue'][this.curBetPerformance];
            this.chartInfo1[0].bodyText = this.chartData['actValue'][this.curBetPerformance +'_infotext'];
            this.isChartBox1 = true;
        } else if(type == 3) {          // For table value chart..
            this.curBetPerformance = subType + "";
            this.chartInfo2[0].chartTitle = "Performance Chart : " + this.curBetPerformance;
            this.isChartBox2 = true;
            this.onTabItem(1);
        } else {                        // For Conditions value chart..
            var condCell = this.condCells[type - 4][subType];
            this.curBetPerformance = this.componentDict[condCell.condID].webText;
            this.chartInfo2[0].chartTitle = "Performance Chart : " + this.curBetPerformance;
            this.isChartBox2 = true;
            this.onTabItem(1);
        }
    }

    handlePNLTabs(tabID, subType) {

        this.chartInfo3.tabID = tabID;

        //Set the icon on top of chart based on the subType selected
        if(subType !== '') {
            this.chartInfo3.subType = subType;
        }


        var subTypeKey = this.chartInfo3.tabKeys[this.chartInfo3.subType];
        var subTypeData = this.chartInfo3.chartData[subTypeKey];
        var tabKeyAssoc = this.chartInfo3.tabIDAssoc[tabID];

        this.chartInfo3.chartTitle = subTypeData["title_txt"];

        this.chartInfo3.tabBody['text'] = subTypeData[tabKeyAssoc['text']];

        if(tabKeyAssoc['isImage']) {
            var imageSrc =  "/" + subTypeData[tabKeyAssoc['html']];

            this.chartInfo3.tabBody['html'] = "<img class='chart-img' src='" + imageSrc + "' />";            
        } else {
            this.chartInfo3.tabBody['html'] = subTypeData[tabKeyAssoc['html']];
        }
    }

    handleImmediateOrderTabs(tabID) { 
        this.chartInfo4.tabID = tabID;

        var tabKey = this.chartInfo4.tabKeys[tabID];
        var tabData = this.chartInfo4.chartData[tabKey];

        if(tabData) {
            this.chartInfo4.tabBody = tabData;
        } 
    }

    onTabItem(itemID) {
        this.tabID = itemID;
        var idx = itemID - 2;

        // For living..
        var objData = this.chartData[this.curBetPerformance];
        if(this.tabID == 1) {
            this.chartInfo2[0].perText = objData['perText'];
            this.chartInfo2[0].signals = objData['signals'];
            this.chartInfo2[0].dateText = this.chartInfo2[0].dateTextDummy + ' ' + objData['dateText'];
        } else {
            this.chartInfo2[0].perText = objData['infoText'];
            this.chartInfo2[0].perChartURL = objData[idx + '_per_file'];
            this.chartInfo2[0].rankText = objData[idx + '_rank_text'];
            this.chartInfo2[0].rankChartURL = objData[idx + '_rank_file'];
            this.chartInfo2[0].dateText = '';
        }

        console.log("[Bet.Component] Performance Chart Data : ", this.curBetPerformance, objData);
    }

    /*------------------------- For general purpose ---------------------------------*/
    alarmDialog(alarmText, alarmButton) {
        this.alarmText = alarmText;
        this.alarmOKBtnText = alarmButton;
        this.alarmModal.open();
    }

    confirmDialog(confirmText, confirmFlag) {
        this.confirmText = confirmText;
        this.confirmModal.open();
        this.confirmConstant = confirmFlag;
    }

    agreeOnConfirm() {
        console.log("[Bet.component] Agree on Confirm Dialog!");
        if(this.confirmConstant == 1) {                 // For process orders confirm..
            // Send http request for reloading..
            console.log("[Bet.component] Refresh Page!");
            location.reload();
        }
    }

}
