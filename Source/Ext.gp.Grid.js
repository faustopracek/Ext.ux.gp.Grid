Ext.define('Ext.gp.Grid', {
    extend   : 'Ext.ux.touch.grid.View',
    xtype    : 'gpgrid',
    showFilterRowPaging:false,
    showFilterRow:false,
    disableFilterRowActions:false,
    pagingBarDocking:'bottom',
    filterRowDelay:1000, 
    defaultFilterRowFieldType:'string', // UPDATED
    constructor: function(config) {
        var me=this;
        var columns = config.columns || me.config.columns || me.columns;
        me.callParent(arguments);
        
        if(config.showFilterRow==true){
            filterRowToolbar= Ext.create('Ext.Toolbar',{
                scope:this,
                xtype:'gpgridtoolbar',
                docked : 'top',
                layout : {
                    type : 'hbox',
                }
            });
            filterRowToolbar.on('painted',this._filterRowToolbarPainted,this,{single: true});
            filterRow = this.add(filterRowToolbar);
            this.on('painted', '_handleGridPaint', this, { buffer : 50 });
        }
        if(this.pagingBarDocking=='bottom'){
            var toolbars=Ext.ComponentQuery.query('toolbar');
            for (c=0; c < toolbars.length; c++) {
                if(toolbars[c].down('button[action=back]')!=null){
                    toolbars[c].setDocked('bottom');
                }
            }
            
        }
    },

    _filterRowToolbarPainted : function (e) {
        this._buildFields(this.getColumns(),e);

        var filterRowCell=Ext.query("div.x-grid-filterrow-cell");

        for (c=0; c < filterRowCell.length; c++) {
            
            var elem = new Ext.Element(filterRowCell[c]);
            elem.update('');
            if(elem.getAttribute('hidden')!="true"&&elem.getAttribute('gridid')==this.getId()){ 
                var fieldHeight=parseInt(e.element.dom.offsetHeight*70/100)+'px';
                var dataIndex = elem.getAttribute('dataindex');
                var filterType = elem.getAttribute('filter');
                var fieldType='Ext.field.Text';
                var pickerDate=null;
                if(filterType=='date'){ 
                    fieldType='Ext.field.DatePicker'; 
                    pickerDate=Ext.create('Ext.picker.Date'); 
                    pickerDate.gpGridId=this.getId();
                    pickerDate.on('show', 
                        function(sender){ 
                            if(sender.down('toolbar button[text=Reset]')==undefined){ 
                                var resetButton=Ext.create('Ext.Button',{
                                    text:'Reset',
                                    scope:Ext.ComponentQuery.query('datepickerfield[fieldName='+dataIndex+'][gpGridFilterField='+this.gpGridId+']')[0],
                                    align:'left',
                                    dataIndex:dataIndex
                                }); 
                                resetButton.on('tap',function(sender){
                                    this.hide();
                                    parentPanel=Ext.ComponentQuery.query('datepickerfield[fieldName='+sender.dataIndex+'][gpGridFilterField='+this.gpGridId+']')[0].parent;
                                    parentPanel.remove(Ext.ComponentQuery.query('datepickerfield[fieldName='+sender.dataIndex+'][gpGridFilterField='+this.gpGridId+']')[0]);
                                    
                                    dateField=Ext.create('Ext.field.DatePicker', { 
                                            flex:1,
                                            placeHolder:'Filter...',
                                            gpGridFilterField:this.gpGridId, 
                                            gpGridFilterFieldType:filterType, 
                                            height       : fieldHeight,
                                            fieldName:dataIndex
                                    });
                                    parentPanel.add(
                                        dateField
                                    );
                                
                                },this); 
                                sender.down('toolbar').add(resetButton); 
                            } 
                        } 
                        //,this 
                    ); 
                    
                } 
                
                var filterField=Ext.create(fieldType, { 
                                        flex:1,
                                        picker: pickerDate, 
                                        placeHolder:'Filter...',
                                        gpGridFilterField:this.getId(), 
                                        gpGridFilterFieldType:filterType, 
                                        height       : fieldHeight,
                                        fieldName:dataIndex
                });
                if(elem.getAttribute('filter')=='date'){ 
                    filterField.on('change',this._applyFilter,this); 
                } 
                else { 
                    filterField.on('keyup',this._applyFilter,this,{buffer: this.filterRowDelay});
                }
                
                panel = Ext.create('Ext.Panel', {
                        renderTo     : elem,
                        scope:this,
                        flex:1,
                        layout:{ type: 'hbox'},
                        
                });
                
                if(this.showFilterRowPaging&&c==0){
                        var btnBack=Ext.create('Ext.Button', { 
                            ui:'back',
                            margin:'10 0 0 10',
                            gpGridFilterBackBtn:this.getId(),
                            height:fieldHeight,
                            disabled : true,
                            scope    : this,
                            handler  : '_handleBackButton'
                        });
                        panel.add(btnBack);
                }
                panel.add(filterField);
                if(this.showFilterRowPaging&&c==filterRowCell.length-1){
                    var btnForward=Ext.create('Ext.Button', { 
                        ui:'forward',
                        margin:'10 10 0 0',
                        gpGridFilterForwardBtn:this.getId(),
                        height:fieldHeight,
                        disabled : true,
                        scope    : this,
                        handler  : '_handleForwardButton'
                    });
                    panel.add(btnForward);
            }
                if (parentPanel=Ext.ComponentQuery.query('datepickerfield[fieldName='+dataIndex+'][gpGridFilterField='+this.getId()+']')[0]!=undefined){ 
                    Ext.ComponentQuery.query('datepickerfield[fieldName='+dataIndex+'][gpGridFilterField='+this.getId()+']')[0].parent.on('add',function(){ 
                        
                        pickerDate=Ext.create('Ext.picker.Date');
                        pickerDate.gpGridId=this.scope.getId();
                        pickerDate.on('show', 
                            function(sender){ 
                                if(sender.down('toolbar button[text=Reset]')==undefined){ 
                                    var resetButton=Ext.create('Ext.Button',{text:'Reset',scope:Ext.ComponentQuery.query('datepickerfield[fieldName='+dataIndex+'][gpGridFilterField='+this.gpGridId+']')[0],align:'left',dataIndex:dataIndex}); 
                                    resetButton.on('tap',function(sender){
                                        this.hide();
                                        parentPanel=Ext.ComponentQuery.query('datepickerfield[fieldName='+sender.dataIndex+'][gpGridFilterField='+this.gpGridId+']')[0].parent;
                                        parentPanel.remove(Ext.ComponentQuery.query('datepickerfield[fieldName='+sender.dataIndex+'][gpGridFilterField='+this.gpGridId+']')[0]);
                                        dateField=Ext.create('Ext.field.DatePicker', { 
                                                flex:1,
                                                placeHolder:'Filter...',
                                                gpGridFilterField:this.gpGridId, 
                                                gpGridFilterFieldType:filterType, 
                                                height       : fieldHeight,
                                                fieldName:dataIndex
                                        }); 
                                        
                                        parentPanel.add(
                                            dateField
                                        );
                                        
                                    },this); 
                                    sender.down('toolbar').add(resetButton); 
                                } 
                            } 
                        ); 
                        Ext.ComponentQuery.query('datepickerfield[fieldName='+dataIndex+'][gpGridFilterField='+this.scope.getId()+']')[0].setPicker(pickerDate);
                        Ext.ComponentQuery.query('datepickerfield[fieldName='+dataIndex+'][gpGridFilterField='+this.scope.getId()+']')[0].on('change',function(){this.scope._applyFilter();},this);
                        this.scope._applyFilter();
                    }); 
                } 
                
                filterField.on('clearicontap',this._filterFieldClearIconTap,this); 
            } 
            
        }
    },
    _filterFieldClearIconTap:function(sender){
        sender.setValue('');
        this._applyFilter();
    },
    _applyFilter:function(){ 
        var store     = this.getStore();
        
        var filterRowCell=Ext.ComponentQuery.query('*[gpGridFilterField='+this.getId()+']'); 
        filtersArray=[];
        for (c=0; c < filterRowCell.length; c++) {
            var textField=filterRowCell[c].getValue();
            if(textField!=null&&textField!=''&&textField!=undefined){
                filtersArray.push({property: filterRowCell[c].fieldName, value: textField, type:filterRowCell[c].gpGridFilterFieldType, root: 'data'}); 
            }
        }
         if(this.disableFilterRowActions==false){
            store.clearFilter();
            store.filter(filtersArray);
        }
        this.fireEvent('filter', this,this.grid,store,filtersArray);
    },
    _handleGridPaint : function(grid) {
        if (!(grid instanceof Ext.ux.touch.grid.View)) {
            grid = this;
        }
        if(grid.getStore()==null){
            return;
        }
        var me    = this
        grid.store = grid.getStore();
        grid.store.on('load', '_handleGridPaint', this);
        if (grid.store.isLoading()) { //if(Ext.data.Connection.isLoading()){    
           return;
        }
        
        var total         = grid.store.getTotalCount(),
            currentPage   = grid.store.currentPage,
            pages         = Math.ceil(total / grid.store.getPageSize()),
            backButton    = Ext.ComponentQuery.query('button[gpGridFilterBackBtn='+this.getId()+']')[0],
            forwardButton = Ext.ComponentQuery.query('button[gpGridFilterForwardBtn='+this.getId()+']')[0]
            console.log();

        backButton.setDisabled(currentPage == 1);
        forwardButton.setDisabled(currentPage == pages);
    },
    _buildFields: function(columns,filterRow) {

        var c          = 0,
            cNum       = columns.length
        var me         = this;
        
        for (; c < cNum; c++) {
                var tpl        = [],
                c          = 0,
                cNum       = columns.length,
                basePrefix = Ext.baseCSSPrefix,
                renderers  = {},
                column, css, styles, attributes, width, renderer, rendererName, innerText;
                
                for (; c < cNum; c++) {
                    column        = columns[c];
                    css           = [basePrefix + 'grid-filterrow-cell'],
                    styles        = [];
                    var filter=this.defaultFilterRowFieldType; 
                    if(column.filterRowFieldType!=undefined){ 
                        filter=column.filterRowFieldType.type; 
                    } 
                    var hiddenField="false"; 
            
                    if(column.filterRowFieldHidden!=undefined){ 
                        hiddenField=column.filterRowFieldHidden; 
                    } 
                    attributes    = ['gridid="'+this.getId()+'" hidden="'+hiddenField+'" filter="' + filter + '" dataindex="' + column.dataIndex + '"']; 
                    
                    width         = column.width;

                    innerText = '';
                    if (width) {
                        styles.push('width: ' + width + (Ext.isString(width) ? '' : 'px') + ';');
                    }
                    if (styles.length > 0) {
                        attributes.push('style ="display        : inline-block;    overflow       : hidden;    text-overflow  : ellipsis;   white-space    : nowrap;    vertical-align : middle;    line-height    : 2.5em; font-size      : 1em;   font-weight    : bold;padding-left:0em;padding-right:0em;' + styles.join(' ') + '"');
                    }
                    tpl.push('<div class="' + css.join(' ') + '" ' + attributes.join('') + '>' + innerText + '</div>');
                }
                tpl = tpl.join('');
                
        }
        filterRow.setHtml(tpl);

    },
    _handleBackButton : function(btn) {
        this.store.previousPage();
    },

    _handleForwardButton : function(btn) {
        this.store.nextPage();
    },
    getFilterFieldValue:function(dataIndex){
        var filterField=Ext.ComponentQuery.query('*[gpGridFilterField='+this.getId()+'][fieldName='+dataIndex+']')[0];
        if(filterField==undefined||filterField==null){
            return null;
        }
        else{
            return filterField.getValue();
        }
    },
    setFilterFieldValue:function(dataIndex,fieldValue,disableApplyFilter){
        if(dataIndex==undefined){
            return;
        }
        var filterField=Ext.ComponentQuery.query('*[gpGridFilterField='+this.getId()+'][fieldName='+dataIndex+']')[0];
        if(filterField==undefined||filterField==null){
            return;
        }
        
        if(filterField.gpGridFilterFieldType=='date'){
            if(fieldValue==''||fieldValue==undefined){
                fieldValue=null;
            }
            fieldHeight=filterField.height;
            parentPanel=filterField.parent;
            parentPanel.remove(filterField);
            console.log(this.getId());
            dateField=Ext.create('Ext.field.DatePicker', { 
                    flex:1,
                    value:fieldValue,
                    placeHolder:'Filter...',
                    gpGridFilterField:this.getId(), 
                    gpGridFilterFieldType:filterField.gpGridFilterFieldType, 
                    height       : fieldHeight,
                    fieldName:dataIndex
            });
            parentPanel.add(
                dateField
            );
        }
        else{
            if(fieldValue==null||fieldValue==undefined){
                fieldValue='';
            }
            filterField.setValue(fieldValue);
        }
        if(!disableApplyFilter){
            this._applyFilter();
        }
    },
    clearAllFilterFields:function(disableApplyFilter){
        var filterRowCell=Ext.ComponentQuery.query('*[gpGridFilterField='+this.getId()+']'); 
        for (c=0; c < filterRowCell.length; c++) {
            this.setFilterFieldValue(filterRowCell[c].fieldName, null,true)
        }
        if(disableApplyFilter==undefined){
            disableApplyFilter=false;
        }
        if(!disableApplyFilter){
            this._applyFilter();
        }
    }
});