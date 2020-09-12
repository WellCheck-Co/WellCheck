from .routesfunc import *

def setuproute(app, call):
    @app.route('/test/',                ['OPTIONS', 'GET'],         lambda x = None: call([])                                            )
    @app.route('/login/',    	        ['OPTIONS', 'POST'],        lambda x = None: call([getauth])                                     )

    @app.route('/signup/',    	        ['OPTIONS', 'POST'],        lambda x = None: call([myauth, signup, signin, gettoken])                               )
    @app.route('/signin/',    	        ['OPTIONS', 'POST'],        lambda x = None: call([myauth, signin, gettoken])                                       )
    @app.route('/renew/',    	        ['OPTIONS', 'GET'],         lambda x = None: call([myauth, authuser, gettoken])                                     )

    @app.route('/infos/',    	        ['OPTIONS', 'GET'],         lambda x = None: call([myauth, authuser, infos])                                        )
    @app.route('/updateinfos/',    	    ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, upinfos, infos])                               )

    @app.route('/addcard/',    	        ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, addcard])                                      )
    @app.route('/delcard/',    	        ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, delcard])                                      )
    @app.route('/listcard/',    	    ['OPTIONS', 'GET'],         lambda x = None: call([myauth, authuser, listcard])                                     )
    @app.route('/payments/',    	    ['OPTIONS', 'GET'],         lambda x = None: call([myauth, authuser, payments])                                     )
    @app.route('/paymentdetails/',      ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, paymentdetails])                               )
    @app.route('/ordertoken/',    	    ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, order_token])                                  )
    @app.route('/order/',    	        ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, cmd_decode, pay, ordering, send_confirm_mail]) )
    @app.route('/orderdetail/',    	    ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, orderdetails])                                 )
    @app.route('/history/',    	        ['OPTIONS', 'GET'],         lambda x = None: call([myauth, authuser, history])                                      )
    @app.route('/emulate/',    	        ['OPTIONS', 'POST'],        lambda x = None: call([myauth, emulate])                                                )
    @app.route('/listaddresses/',       ['OPTIONS', 'GET'],         lambda x = None: call([myauth, authuser, list_addresses])                               )
    @app.route('/addaddress/',          ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, add_address])                                  )
    @app.route('/deladdress/',          ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, del_address])                                  )
    @app.route('/getaddress/',    	    ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, get_address])                                  )

    @app.route('/point/add/',    	    ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, point_add])                                    )
    @app.route('/point/share/',    	    ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, point_share])                                  )
    @app.route('/point/rename/',        ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, point_rename])                                 )
    @app.route('/point/infos/',         ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, point_infos])                                  )
    @app.route('/point/graph/',         ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, point_graph])                                  )

    @app.route('/points/infos/',        ['OPTIONS', 'POST'],        lambda x = None: call([myauth, authuser, points_infos])                                 )
    @app.route('/points/shared/',       ['OPTIONS', 'GET'],         lambda x = None: call([myauth, authuser, points_shared])                                )

    @app.route('/data/add/',            ['OPTIONS', 'POST'],        lambda x = None: call([myauth, data_add])                                               )

    @app.route('/pdf/report/',          ['OPTIONS', 'POST'],        lambda x = None: call([pdf_report])                                                     )

    @app.route('/admin/login/',         ['OPTIONS', 'POST'],        lambda x = None: call([admtoken])                                                       )
    @app.route('/admin/allusers/',      ['OPTIONS', 'GET'],         lambda x = None: call([authadmin, all_users])                                           )
    @app.route('/admin/spoof/',         ['OPTIONS', 'POST'],        lambda x = None: call([authadmin, gettokenadm])                                         )
    @app.route('/admin/newOrders/',     ['OPTIONS', 'GET'],         lambda x = None: call([authadmin, get_new_orders])                                      )
    @app.route('/admin/validateOrder/', ['OPTIONS', 'POST'],        lambda x = None: call([authadmin, accept_order, send_mail_accepted])                    )
    @app.route('/admin/rejectOrder/',   ['OPTIONS', 'POST'],        lambda x = None: call([authadmin, reject_order, send_mail_rejected])                    )

    @app.route('/data/add/',            ['OPTIONS', 'POST'],        lambda x = None: call([data_add])                                                       )
    @app.route('/sigfox', 	            ['OPTIONS', 'GET'], 	    lambda x = None: call([sigfox_data_get])                                                )
    @app.route('/sigfox',               ['OPTIONS', 'POST'],        lambda x = None: call([sigfox_data_add])                                                )
    def base():
        return
