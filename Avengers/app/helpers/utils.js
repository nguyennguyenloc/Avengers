let createFilterStatus = async (currentStatus, collection) => {
  const currentModel = require(__path_schemas + collection);

    let statusFilter = [
        { name: 'All', value: 'all', countDocuments: 1, class: 'success' },
        { name: 'Active', value: 'active', countDocuments: 1, class: 'warning' },
        {name: 'InActive', value: 'inactive', countDocuments: 1, class: 'danger',},
      ];

      for(let index = 0; index < statusFilter.length; index++){
        let item = statusFilter[index];
        let condition = (item.value !== "all") ? { status: item.value } : {};
        if(item.value===currentStatus) statusFilter[index].class='default';
        await currentModel.countDocuments(condition).then((data) => {
          statusFilter[index].countDocuments = data;
        });
      }
      return statusFilter;
}
module.exports = {
    createFilterStatus: createFilterStatus
}