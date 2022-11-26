import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from pymongo import MongoClient
import sys
from pandas.tseries.offsets import DateOffset
import statsmodels.api as sm

mongoConn=MongoClient("mongodb+srv://Admin:Admin@cluster0-q4yrs.mongodb.net/FP?retryWrites=true&w=majority")
my_db=mongoConn["FP"]
my_col=my_db["CSVS"+sys.argv[1]]

df=pd.DataFrame(list(my_col.find()))
df.drop(columns="_id",inplace=True)


#df=pd.read_csv('restaurant-1-orders.csv')

#finding no. of distinct items
items=df['Item Name'].unique()

for i in range(0,len(items)):  
    
    #getting data of first distinct item
    df1=df[df['Item Name']==items[i]]
    df1.columns=df1.columns.str.replace("\r","")
    df1.rename(columns={'Total products':'sales','Order Date':'date'},inplace=True) 
    df1['sales']=df1['sales'].str.replace("\r","")
    df1['sales']=pd.to_numeric(df1['sales'])
    
     
    #print(df1)
    
    df1['date']=pd.to_datetime(df1['date'])
    df1.dropna(inplace=True)
    data=df1.groupby(['date'],sort=True).sales.sum().reset_index()
    
    #filling missing dates
    data = data.set_index('date').asfreq('d', fill_value=0)
    
    data['sales']=data['sales'].iloc[-50:]    
    print(data,data.shape[0])
    data.dropna(inplace=True)
    if(data.shape[0]<31):
        print("size is too small")
        continue    
        
    #print(data['sales'])
    #data.plot()
    #plt.show()
    from statsmodels.tsa.stattools import adfuller
    test_result=adfuller(data['sales'])
    fs=True
    
    #dicky fuller test
    def adfuller_test(sales):
        result=adfuller(sales)
        labels=['ADF Test Statistic','p-value','#lags used','no. of observations used']
        for value,label in zip(result,labels):
            print(label+' : '+str(value))
        if( result[1] <=0.05 ):
            print("strong evidence against the null hypothesis, reject null hypothesis it is stationary")
            return True
        else:
            print("weak evidence against null hypothesis,time series has a unit root, indicating its non stationary")
            return False

    #data shifting for null hypothesis
    def modData(x):
        x=x-x.shift(30)

        x.dropna(inplace=True)
        return x

    if(adfuller_test(data['sales'])==False):
        data=modData(data)
        
    print(adfuller_test(data['sales']))
    #print(data.describe())



    '''
    from statsmodels.graphics.tsaplots import plot_acf,plot_pacf
    fig=plt.figure(figsize=(12,8))
    ax1=fig.add_subplot(211)
    fig=plot_acf(data['sales'].iloc[13:],lags=40,ax=ax1)
    ax2=fig.add_subplot(212)
    fig=plot_pacf(data['sales'].iloc[13:],lags=40,ax=ax2)
    plt.show() 
    '''


    print(data['sales'])

    #creating model
    
    model=sm.tsa.statespace.SARIMAX(data['sales'],order=(1,1,1),seasonal_order=(1,1,1,30))
    results=model.fit(disp=0)
    length=data.size
    data['forecast']=results.predict(start=data.size-30,end=data.size-1,dynamic=True)

    results.forecast(steps=10,exog=data['sales']) 

    data[['sales','forecast']].plot(figsize=(12,8))
    #print(data)

    #forecasting future sales
    
    future_dates=[data.index[-1]+ DateOffset(days=x)for x in range(0,24)]
    future_df=pd.DataFrame(index=future_dates[1:],columns=data.columns)
    future_df=pd.concat([data,future_df])

    future_df['forecast']=results.predict(start=length,end=length+25,dynamic=True)
    future_df[['sales','forecast']].plot(figsize=(12,8))
    Obj={ 'Item Name': items[i], 'predictions': 
            { 'Order Date': future_df.tail(24).index.tolist() , 'sales': future_df.tail(24)['forecast'].tolist() }
    }

    f_col=my_db["predictions"+sys.argv[1]]

    f_col.insert_one(Obj)


    print(Obj)
my_col.drop()