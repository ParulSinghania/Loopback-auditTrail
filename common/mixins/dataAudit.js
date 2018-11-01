module.exports = function(Model, options) {
  Model.observe('after save', (ctx, next) => {
    Model.getApp((err, a) => {
      let app =a;
     
      let currentUser =  ctx.options.accessToken.userId;
      //If it's a new instance, set the createdBy to currentUser
      if (ctx.isNewInstance) {
        const instance =JSON.stringify(ctx.instance);
        app.dataSources.rxa.models.MimpAuditTrail.create({
          old: null,
          new: instance,
          action: 'create',
          table_name: Model.modelName,
          createdAt : new Date(),
          updatedAt :new Date(),
          createdBy : currentUser,
          updatedBy : currentUser
        }, next);
      } else {
          if (ctx.options.oldInstance && ctx.data) {
            const inst = JSON.stringify(ctx.data);
            const oldInstance = JSON.stringify(ctx.options.oldInstance);
            app.dataSources.rxa.models.MimpAuditTrail.create({
              old: oldInstance,
              new: inst,
              action: 'update',
              table_name: Model.modelName,
              createdAt : null,
              updatedAt : new Date(),
              createdBy : null,
              updatedBy : currentUser
            }, next);
          } 
           else {
            console.log('Cannot register update without old and new instance. Options: %j', ctx.options);
            console.log('instance: %j', ctx.instance);
            console.log('data: %j', ctx.data);
            return next();
          }
        }
      })
  });

  function getOldInstance(ctx, cb) {
      if(typeof ctx.isNewInstance === 'undefined' || !ctx.isNewInstance){
        let id = ctx.instance ? ctx.instance.id : null;
        if (!id) {
          id = ctx.data ? ctx.data.id : null;
        }
        if (!id && ctx.where) {
          id = ctx.where.id;
        }
        if (!id && ctx.options.remoteCtx) {
          id = ctx.options.remoteCtx.req && ctx.options.remoteCtx.req.args ?
            ctx.options.remoteCtx.req.args.id : null;
        }
        if (id) {
          Model.findById(id, {deleted: true}, (err, oldInstance) => {
            if (err) { cb(err); } else { cb(null, oldInstance); }
          });
        } else {
          const query = {where: ctx.where} || {};
          Model.find(query, (err, oldInstances) => {
            if (err) {
              cb(err);
            } else {
              if (oldInstances.length > 1) {
                return cb(null, oldInstances);
              } else if (oldInstances.length === 0) {
                return cb();
              }
              cb(null, oldInstances[0]);
            }
          });
        }
    }else{
      cb()
    }
  }

  Model.observe('before save', (ctx, next) => {
    getOldInstance(ctx, (err, result) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      
      if (Array.isArray(result)) {
        ctx.options.oldInstances = result;
      } else {
        ctx.options.oldInstance = result;
      }
      //Need to  determine the currently logged in user
      let currentUser =  ctx.options.accessToken.userId
      // // If it's a new instance, set the createdBy to currentUser
      if (ctx.isNewInstance) {
        ctx.instance.createdBy = currentUser;
      } else {
      }

      Model.getApp((err, a) => {
        if (err) { return console.error(err);}
        app = a;
      });

      return next();
    });
  });

 
};
