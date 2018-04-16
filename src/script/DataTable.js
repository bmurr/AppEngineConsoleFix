import {prettifyBytes} from './utils';

class DataTable {
    constructor (rows, headers, bytesInUse=undefined) {
        this._rows = Object.freeze(rows);
        this._headers = Object.freeze(headers);
        this._bytesInUse = bytesInUse || 0;
        
        this._cache = {};        
    }

    get headers () {
        if (this._cache.hasOwnProperty('headers')){
            return this._cache['headers'];
        }
        return this._headers;
    }

    get rows() {
        if (this._cache.hasOwnProperty('rows')){
            return this._cache['rows'];
        }
        return this._rows;
    }

    get summary() {
        if (this._cache.hasOwnProperty('summary')){
            return this._cache['summary']
        }
        const summary = this.computeSummary();
        this._cache['summary'] = summary;
        return summary
    }

    clearRowFilter(){
      delete(this._cache['rows']);
      delete(this._cache['summary']);
    }

    resetHeaderKeys(){
      delete(this._cache['headers']);
    }

    setHeaderKeys (headerKeys) {
      const headers = this._headers.filter(v => headerKeys.indexOf(v['key']) !== -1);
      this._cache['headers'] = headers;
    }

    setRowFilter(func){
      const rows = this._rows.filter(func);      
      this._cache['rows'] = rows;
      delete(this._cache['summary']);
    }

    computeSummary(){
      return {
        logCount: Object.keys(this.rows).length,
        usage: prettifyBytes(this._bytesInUse)
      };
    }

}

export default DataTable;
