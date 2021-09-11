let getParams = (params, property, defaultValue) => {
    if(params.hasOwnProperty(property) && params[property] !== undefined){
        return params[property];
    }
    return defaultValue;
}

let createParam = (req) => {
    let params 		 	 = {};

	params.keyword		 = getParams(req.query, 'keyword', '');
	params.currentStatus = getParams(req.params, 'special', 'all'); 
	params.sortField  	 = getParams(req.session, 'sort_field', 'name');
	params.sortType 	 = getParams(req.session, 'sort_type', 'asc');
	params.groupID 		 = getParams(req.session, 'group_id', '');
	params.categoryID 	 = getParams(req.session, 'category_id', ''); 

	params.pagination  	 = {
		totalItems		 : 1,
		totalItemsPerPage: 4,
		currentPage		 : parseInt(getParams(req.query, 'page', 1)),
		pageRanges		 : 3
	};

	return params;
}

module.exports = {
    getParams,
    createParam
}