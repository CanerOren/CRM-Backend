const {
  getData,
  getDataList,
  saveData,
  deleteData,
} = require('../../models/defines/userTypesModel');
const abilitiesModel = require('../../models/core/abilitiesModel');
const userTypesAbilitiesModel = require('../../models/core/userTypesAbilitiesModel');
const { setUser } = require('../../core/controllers/functions');
async function index(req, res) {
  try {
    let paramData = req.body;
    if (!paramData) {
      paramData = [];
    }
    const data = await getDataList(paramData);
    res.json({ dataCount: data.dataCount, data: data.data });
  } catch (err) {
    console.error('Veri hatası:', err);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}

async function getRow(req, res) {
  try {
    let paramData = req.body;
    const data = await getData(paramData.id);
    var abilitiesData = await abilitiesModel.getDataList({});
    const processAbilities = (data) => {
      // Main groupa göre göre gruplama

      const groupData = data.reduce((acc, item) => {
        if (!acc[item.main_group]) {
          acc[item.main_group] = [];
        }
        acc[item.main_group].push(item);
        return acc;
      }, {});
      //sub grouplara göre (groups) gruplama
      const result = Object.keys(groupData).map((abilityGroup) => {
        const groups = groupData[abilityGroup].reduce((acc, item) => {
          if (!acc[item.groups]) {
            acc[item.groups] = [];
          }
          acc[item.groups].push(item);
          return acc;
        }, {});
        // groupları uygun şekilde yapılandarma
        const groupsArray = Object.keys(groups).map((subGroup) => ({
          sub_group: subGroup,
          items: groups[subGroup],
        }));
        return {
          ability_group: abilityGroup,
          sub_groups: groupsArray,
        };
      });
      return result;
    };
    abilitiesData = processAbilities(abilitiesData.data);
    abilitiesData = await updateCheckedStatus(abilitiesData, data);
    data.user_type_ability = abilitiesData;
    res.json({ data: data });
  } catch (err) {
    console.error('Veri hatas:', err);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}

async function createData(req, res) {
  try {
    let status = false;
    let message = null;
    let response = null;
    let params = req.body;
    params = setUser(params, req.user);
    response = await saveData(params);
    if (response) {
      status = true;
      params.id = response.id;
      await setTypeAbilitiy(params);
    }
    if (status) {
      message = 'İşlem başarılı.';
    } else {
      message = 'İşlem başarısız.';
    }
    res.json({
      status: status,
      message: message,
      id: response,
    });
  } catch (err) {
    console.error('Veri hatası:', err);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}

async function removeData(req, res) {
  try {
    let status = false;
    let message = null;
    let response = null;
    let params = req.body;
    params.id_updated_by = req.user.id;
    response = await deleteData(params);
    if (response) {
      status = true;
    }
    if (status) {
      message = 'İşlem başarılı.';
    } else {
      message = 'İşlem başarısız.';
    }
    res.json({
      status: status,
      message: message,
      id: response,
    });
  } catch (err) {
    console.error('Veri hatası:', err);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
}

async function updateCheckedStatus(abilitiesData, data) {
  for (const [key, row] of abilitiesData.entries()) {
    for (const [skey, subGroups] of row.sub_groups.entries()) {
      for (const [ikey, item] of subGroups.items.entries()) {
        const typeAbilitiesData = await userTypesAbilitiesModel.getDataList({
          where: {
            id_abilities: item.id,
            id_user_types: data.id,
          },
        });
        if (typeAbilitiesData.data.length > 0) {
          abilitiesData[key].sub_groups[skey].items[ikey].checked = true;
        } else {
          abilitiesData[key].sub_groups[skey].items[ikey].checked = false;
        }
      }
    }
  }
  return abilitiesData;
}

async function setTypeAbilitiy(data) {
  if (data.hasOwnProperty('user_type_ability')) {
    await userTypesAbilitiesModel.deleteData(data.id, false);
    for (const row of data.user_type_ability) {
      for (const sub_group of row.sub_groups) {
        for (const item of sub_group.items) {
          if (item.checked) {
            await userTypesAbilitiesModel.saveData({
              id_abilities: item.id,
              id_user_types: data.id,
            });
          }
        }
      }
    }
  }
}

module.exports = { index, getRow, createData, removeData };
