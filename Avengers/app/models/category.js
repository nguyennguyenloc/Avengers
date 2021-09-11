const categoryModel = require(__path_schemas + 'category');
const stringHelpers = require(__path_helpers + 'string');

module.exports = {
    listItems: (params, options = null) => {
        let objWhere = {};
        if(params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if(params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        // console.log(objWhere);
        let sort  = {};
        sort[params.sortField] = params.sortType;
        return  categoryModel
            .find(objWhere)
            .select('name status ordering created modified slug')
            .sort(sort)
            .skip((params.pagination.currentPage - 1) * params.pagination.totalItemsPerPage)
            .limit(params.pagination.totalItemsPerPage)
    },

    listItemsFrontend: (params = null, options = null) => {
        let find = {};
        let select = 'name';
        let limit = 10;
        let sort = '';

        if(options.task == 'items-in-menu'){
            find = {status: 'active'};
            sort = {ordering: 'asc'};
        }

        return categoryModel.find(find).select(select).limit(limit).sort(sort);
    },

    listItemsInSelectbox: (params, options = null) => {
        return categoryModel.find({}, {_id: 1, name: 1});
    },

    getItems: (id) => {
        return categoryModel.findById(id);
    },

    countItem: (params, options = null) => { 
        let objWhere = {};
        if(params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if(params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return categoryModel.countDocuments(objWhere) 
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
            return categoryModel.updateOne({_id: id}, data);
        }

        if(options.task == "update-multi"){
            data.status = currentStatus;
            return categoryModel.updateMany({_id: {$in: id}}, data);
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
              await categoryModel.updateOne({_id: cids[index]}, data);
            }
            return Promise.resolve("Success");
        }else{
            return categoryModel.updateOne({_id: cids}, data);  
          }
    },

    deleteItems: (id, options = null) => {
        if(options.task == "delete-one"){
            return categoryModel.deleteOne({_id: id}); 
        }

        if(options.task == "delete-multi"){
            return categoryModel.deleteMany({_id: {$in: id}});
        }
    },

    saveItems: (item, options = null) => {
        if(options.task == "add"){
            item.created = {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
            item.slug = stringHelpers.createAlias(item.slug);
            return  new categoryModel(item).save();
        }

        if(options.task == "edit"){
            return categoryModel.updateOne({_id: item.id}, {
                ordering: parseInt(item.ordering),
                name: item.name,
                status: item.status,
                slug: stringHelpers.createAlias(item.slug),
                content: item.content,
                modified: {
                  user_id: 0,
                  user_name: "admin",
                  time: Date.now()
                }
            });
        }
    }
}