const fileHelpers = require(__path_helpers + 'file');
const itemsModel = require(__path_schemas + 'users');
const uploadFolder = 'public/uploads/users/';

module.exports = {
    listItems: (params, options = null) => {
        let objWhere = {};
        if(params.groupID !== 'allvalue' && params.groupID !== '') objWhere['group.id'] = params.groupID;
        if(params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if(params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        let sort  = {};
        sort[params.sortField] = params.sortType;
        return  itemsModel
            .find(objWhere)
            .select('name username avatar status ordering created modified group.name')
            .sort(sort)
            .skip((params.pagination.currentPage - 1) * params.pagination.totalItemsPerPage)
            .limit(params.pagination.totalItemsPerPage)
    },
    
    getItems: (id) => {
        return itemsModel.findById(id);
    },

    getItemByUsername: (username, options = null) => {
        if(options == null) {
            return itemsModel.find({status:'active', username: username})
                            .select('username password avatar status group.name')
        } 
    },

    countItem: (params, options = null) => { 
        let objWhere = {};
        if(params.groupID !== 'allvalue' && params.groupID !== '') objWhere['group.id'] = params.groupID;
        if(params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if(params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return itemsModel.countDocuments(objWhere); 
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
            return itemsModel.updateOne({_id: id}, data);
        }

        if(options.task == "update-multi"){
            data.status = currentStatus;
            return itemsModel.updateMany({_id: {$in: id}}, data);
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
              await itemsModel.updateOne({_id: cids[index]}, data);
            }
            return Promise.resolve("Success");
        }else{
            return itemsModel.updateOne({_id: cids}, data);  
        }
    },

    deleteItems: async (id, options = null) => {
        if(options.task == "delete-one"){
            await itemsModel.findById(id).then((item) => {
                fileHelpers.remove(uploadFolder, item.avatar);
            });
            return itemsModel.deleteOne({_id: id}); 
        }

        if(options.task == "delete-multi"){
            if(Array.isArray(id)){
                for(let index = 0; index < id.length; index++){
                    await itemsModel.findById(id[index]).then((item) => {
                        fileHelpers.remove(uploadFolder, item.avatar);
                    }); 
                }
            }else{
                await itemsModel.findById(id).then((item) => {
                    fileHelpers.remove(uploadFolder, item.avatar);
                }); 
            }
            return itemsModel.deleteMany({_id: {$in: id}});
        }
    },

    saveItems: (item, options = null) => {
        if(options.task == "add"){
            item.created = {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
            item.group = {
                id: item.group_id,
                name: item.group_name
            }
            return  new itemsModel(item).save();
        }

        if(options.task == "edit"){
            return itemsModel.updateOne({_id: item.id}, {
                ordering: parseInt(item.ordering),
                name: item.name,
                username: item.username,
                password: item.password,
                status: item.status,
                content: item.content,
                avatar: item.avatar,
                group : {
                    id: item.group_id,
                    name: item.group_name
                },
                modified: {
                  user_id: 0,
                  user_name: "admin",
                  time: Date.now()
                }
            });
        }

        if(options.task == "change-group-name"){
            return itemsModel.updateMany({'group.id': item.id}, {
                group: {
                    id: item.id,
                    name: item.name
                }
            });
        }
    }

}