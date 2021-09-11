const fileHelpers = require(__path_helpers + 'file');
const articleModel = require(__path_schemas + 'article');
const uploadFolder = 'public/uploads/article/';
module.exports = {
    listItems: (params, options = null) => {
        let objWhere = {};
        if(params.categoryID !== 'allvalue' && params.categoryID !== '') objWhere['category.id'] = params.categoryID;
        if(params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if(params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        let sort  = {};
        sort[params.sortField] = params.sortType;
        console.log(params);
        return  articleModel
            .find(objWhere)
            .select('name thumb status special ordering created modified category.name')
            .sort(sort)
            .skip((params.pagination.currentPage - 1) * params.pagination.totalItemsPerPage)
            .limit(params.pagination.totalItemsPerPage)
    },
    
    listItemsSearch: (params, options = null) =>{
        let objWhere    = {};
        let sort		= {};
        if(params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');

        return articleModel
            .find(objWhere)
            .select('name thumb slug status special ordering created modified category.name')
            .sort(sort)
            .limit(9);
    },
    
    listItemsFrontend: (params = null, options = null) => {
        let find = {};
        let select = '';
        let limit = 0;
        let sort = '';

        if(options.task == 'items-popular'){
            find = {status:'active', special:'active'};
            select = 'name created.user_name created.time category.id category.name thumb';
            limit = 3;
            sort = {ordering: 'asc'};
        }

        if(options.task == 'items-special'){
            find = {status:'active', special:'active'};
            select = 'name created.user_name created.time category.id category.name thumb';
            limit = 3;
            sort = {ordering: 'asc'};
        }

        if(options.task == 'items-news'){
            find = {status:'active'};
            select = 'name created.user_name created.time category.id category.name thumb content';
            limit = 4;
            sort = {'created.time': 'desc'};
        }

        if(options.task == 'items-in-category'){
            find = {status:'active', 'category.id': params.id};
            select = 'name created.user_name created.time category.id category.name thumb content';
            limit = 4;
            sort = {'created.time': 'desc'};
        }

        if(options.task == 'items-random'){
            return articleModel.aggregate([
                { $match: {status: 'active'}},
                { $project:  {name: 1, created: 1, thumb: 1}},
                { $sample: {size: 2}}
            ]);
        }

        if(options.task == 'items-others'){
            console.log(params);
            select = 'name created.user_name created.time category.id category.name thumb content';
            find = {status:'active', '_id': {$ne: params._id}, 'category.id': params.category.id};
            limit = 3;
            sort = {'created.time': 'desc'};
        }

        return articleModel.find(find).select(select).limit(limit).sort(sort);
    },

    getItems: (id) => {
        return articleModel.findById(id);
    },

    getItemsFrontend: (id, options = null) => {
        return articleModel.findById(id).select('name thumb created content category.id category.name');
    },

    countItem: (params, options = null) => { 
        let objWhere = {};
        if(params.categoryID !== 'allvalue' && params.categoryID !== '') objWhere['category.id'] = params.categoryID;
        if(params.currentStatus !== 'all') objWhere.status = params.currentStatus;
        if(params.keyword !== '') objWhere.name = new RegExp(params.keyword, 'i');
        return articleModel.countDocuments(objWhere); 
    },

    changeSpecial: (id, currentSpecial, options = null) => {
        let special        = (currentSpecial === "active") ? "inactive" : "active";
        let data          = {
            special: special,
            modified: {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
        }

        if(options.task == "update-one"){
            return articleModel.updateOne({_id: id}, data);
        }

        if(options.task == "update-multi"){
            data.special = currentSpecial;
            return articleModel.updateMany({_id: {$in: id}}, data);
        }
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
            return articleModel.updateOne({_id: id}, data);
        }

        if(options.task == "update-multi"){
            data.status = currentStatus;
            return articleModel.updateMany({_id: {$in: id}}, data);
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
              await articleModel.updateOne({_id: cids[index]}, data);
            }
            return Promise.resolve("Success");
        }else{
            return articleModel.updateOne({_id: cids}, data);  
        }
    },

    deleteItems: async (id, options = null) => {
        if(options.task == "delete-one"){
            await articleModel.findById(id).then((item) => {
                fileHelpers.remove(uploadFolder, item.thumb);
            });
            return articleModel.deleteOne({_id: id}); 
        }

        if(options.task == "delete-multi"){
            if(Array.isArray(id)){
                for(let index = 0; index < id.length; index++){
                    await articleModel.findById(id[index]).then((item) => {
                        fileHelpers.remove(uploadFolder, item.thumb);
                    }); 
                }
            }else{
                await articleModel.findById(id).then((item) => {
                    fileHelpers.remove(uploadFolder, item.thumb);
                }); 
            }
            return articleModel.deleteMany({_id: {$in: id}});
        }
    },

    saveItems: (item, options = null) => {
        if(options.task == "add"){
            item.created = {
                user_id: 0,
                user_name: "admin",
                time: Date.now()
            }
            item.category = {
                id: item.category_id,
                name: item.category_name
            }
            return  new articleModel(item).save();
        }

        if(options.task == "edit"){
            return articleModel.updateOne({_id: item.id}, {
                ordering: parseInt(item.ordering),
                name: item.name,
                status: item.status,
                special: item.special,
                content: item.content,
                thumb: item.thumb,
                category : {
                    id: item.category_id,
                    name: item.category_name
                },
                modified: {
                  user_id: 0,
                  user_name: "admin",
                  time: Date.now()
                }
            });
        }

        if(options.task == "change-category-name"){
            return articleModel.updateMany({'category.id': item.id}, {
                category: {
                    id: item.id,
                    name: item.name
                }
            });
        }
    }

}