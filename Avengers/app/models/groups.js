const groupsModel = require(__path_schemas + 'groups');

module.exports = {
    listItems: (params, options = null) => {
        let objWhere = {};
        if(params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if(params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        console.log(objWhere);
        let sort  = {};
        sort[params.sortField] = params.sortType;
        return  groupsModel
            .find(objWhere)
            .select('name status ordering created modified group_acp')
            .sort(sort)
            .skip((params.pagination.currentPage - 1) * params.pagination.totalItemsPerPage)
            .limit(params.pagination.totalItemsPerPage)
    },

    listItemsInSelectbox: (params, options = null) => {
        return groupsModel.find({}, {_id: 1, name: 1});
    },

    getItems: (id) => {
        return groupsModel.findById(id);
    },

    countItem: (params, options = null) => { 
        let objWhere = {};
        if(params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if(params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return groupsModel.countDocuments(objWhere) 
    },

    changeStatus: (id, currentStatus, options = null) => {
        let status        = (currentStatus === "active") ? "inactive" : "active";
        let data          = {
            status: status,
            modified: {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
        }

        if(options.task == "update-one"){
            return groupsModel.updateOne({_id: id}, data);
        }

        if(options.task == "update-multi"){
            data.status = currentStatus;
            return groupsModel.updateMany({_id: {$in: id}}, data);
        }
    },

    changeOrderings:async (cids, orderings, options = null) => {
        let data          = {
            ordering: parseInt(orderings),
            modified: {
              user_id: 0,
              user_name: 0,
              time: Date.now()
            }
          }
        if(Array.isArray(cids)){
            for(let index = 0; index < cids.length; index++){
              data.ordering = parseInt(orderings[index]);
              await groupsModel.updateOne({_id: cids[index]}, data);
            }
            return Promise.resolve("Success");
        }else{
            return groupsModel.updateOne({_id: cids}, data);  
          }
    },

    deleteItems: (id, options = null) => {
        if(options.task == "delete-one"){
            return groupsModel.deleteOne({_id: id}); 
        }

        if(options.task == "delete-multi"){
            return groupsModel.deleteMany({_id: {$in: id}});
        }
    },

    saveItems: (item, options = null) => {
        if(options.task == "add"){
            item.created = {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
              }
            return  new groupsModel(item).save();
        }

        if(options.task == "edit"){
            return groupsModel.updateOne({_id: item.id}, {
                ordering: parseInt(item.ordering),
                name: item.name,
                status: item.status,
                content: item.content,
                group_acp: item.group_acp,
                modified: {
                  user_id: 0,
                  user_name: "admin",
                  time: Date.now()
                }
              });
        }
    },

    changeGroupACP: (id, currentGroups, options = null) => {
        let groupACP      = (currentGroups === "yes") ? "no" : "yes";
        let data          = {
            group_acp: groupACP,
            modified: {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
        }
        return groupsModel.updateOne({_id: id}, data);
    }

}