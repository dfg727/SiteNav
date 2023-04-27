class BmobHelper {
    constructor() {
        Bmob.initialize("3741b75a3d7d5311", "000000");
        this.tableName = "sudoku_puzzle";
    }
    
    //http://doc.bmob.cn/data/wechat_app_new/index.html#_26
    getRecords(data) {
        const {search, callback, tableName=this.tableName} = data;
        var query = new Bmob.Query(tableName);
        
        if (search && search['queries']) {
            search['queries'].map(item => query.equalTo(item.criteria, item.condition, item.value));
        }
        if (search && search['orders']) {
            search['orders'].map(item => query.order(item));
        }
        if (search && search['limit']) {
            query.limit(search['limit']);
        }
        
        return query.find().then(res => {
            console.log(res);
            callback && callback(res);
            return res;
        }).catch(err => {
            console.log('getRecord err:',err)
        });
    }
    
    saveRecord(data) {
        const {record, callback, tableName=this.tableName} = data;
        const query = Bmob.Query(tableName);
        
        for (var key in record) {
            query.set(key, record[key]);
        }
        
        return query.save().then(res => {
            console.log(res)
            callback && callback(res);
            return res;
        }).catch(err => {
            console.log('saveRecord err:', err)
        });
    } 
    
    deleteRecord(data) {
        const {id, callback, tableName=this.tableName} = data;
        const query = Bmob.Query(tableName);
        
        return query.destroy(id).then(res => {
            console.log(res)
            callback && callback(res);
            return res;
        }).catch(err => {
          console.log('deleteRecord err:', err)
        });
    } 
}

/*
var bmobHelper = new BmobHelper();

//query
bmobHelper.getRecords({
    search: {
        queries: [{
            criteria: "status",
            condition: "==",
            value: "E",
        }],
        orders: ["-updatedAt"],
        limit: 10,
    },
    callback: function(response) {
        console.log(response);
    }
});

//create record
var puzzle = {
    name: 'sample',
    puzzle: '0',
    status: 'D'
};
bmobHelper.saveRecord({
    record: puzzle,
    callback: function(response) {
        console.log(response);
    }
});

//update record
var puzzle = {
    id: 'bdd7a9f336',
    puzzle: '01',
};
bmobHelper.saveRecord({
    record: puzzle,
    callback: function(response) {
        console.log(response);
    }
});
  
//delete record
bmobHelper.deleteRecord({
    id: 'bdd7a9f336',
    callback: function(response) {
        console.log(response);
    }
});
*/  

