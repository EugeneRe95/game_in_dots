import React, { Component } from 'react';
import axios from 'axios';


import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';

export class Field extends Component {
    constructor(props) {
        super(props)
        this.state = {
            userName: '',
            randomCell: '',
            color: '#fff',
            settings: [],
            results: [],
            modes: [],
            mode: 'easyMode',
            field: 5,
            cols: [1, 2, 3, 4, 5],
            user: 0,
            computer: 0,
            play: '',
            winner: '',
            button: 'Play'
        }
        this.handleChange = this.handleChange.bind(this)
        this.play = this.play.bind(this)
        this.check = this.check.bind(this)
        this.timeout = this.timeout.bind(this)
        this.winner = this.winner.bind(this)
        this.saveResult = this.saveResult.bind(this)
    }

    //Fetching game setting and winners list
    componentDidMount() {
        axios.get(`https://starnavi-frontend-test-task.herokuapp.com/game-settings`)
            .then(res => {
                const settings = res.data;
                this.setState({ settings: settings, modes: Object.keys(settings) });
            });
        axios.get(`https://starnavi-frontend-test-task.herokuapp.com/winners`)
            .then(res => {
                const results = res.data;
                this.setState({ results: results })
            });
    }

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value }, () => {
            if (this.state.mode) {
                this.setState({ field: this.state.settings[this.state.mode].field, color: '#fff' }, function () {
                    let cols = [];
                    if (cols) {
                        for (let i = 1; i <= this.state.field; i++) {
                            cols.push(i)
                        }
                        this.setState({ cols: cols })
                    }
                })
            }
        })
    }

    // Function for result setting after clicking on specific cell 
    check(e) {
        if (!this.state.play && this.state.randomCell !== '') {
            if (e.target.closest('td')) {
                if (e.target.getAttribute('data-picked')) {
                    clearTimeout(this.time)
                    this.setState({ color: 'green', user: this.state.user + 1, play: true }, () => {
                        if (this.state.winner === '') {
                            setTimeout(() => { this.play() }, 1000)
                        }
                        this.winner();
                    })
                } else {
                    clearTimeout(this.time)
                    this.setState({ color: 'red', computer: this.state.computer + 1, play: true }, () => {
                        this.winner();
                        if (this.state.winner === '') {
                            setTimeout(() => { this.play(); }, 1000)
                        }
                    })
                }
            }
        }
    }
    // setting timeout which is installed by mode difficulty
    timeout() {
        this.time = setTimeout(() => {
            this.setState({ color: 'red', computer: this.state.computer + 1, play: true }, () => {
                this.winner();
                if (this.state.winner === '') {
                    setTimeout(() => { this.play(); }, 1000)
                }
            })
        }, this.state.settings[this.state.mode].delay);
    }
    // Continous generating of random cell until the winner is choosen
    play() {
        clearTimeout(this.time)
        if (this.state.winner === '') {
            const row = Math.floor(Math.random() * this.state.field) + 1;
            const col = Math.floor(Math.random() * this.state.field) + 1;
            this.setState({ randomCell: row + '' + col, color: 'blue', play: false })
            this.timeout();
        }
    }
    // Restarting the game
    restart() {
        if (this.state.winner !== '') {
            this.setState({ winner: '', button: 'Play' }, () => {
                const row = Math.floor(Math.random() * this.state.field) + 1;
                const col = Math.floor(Math.random() * this.state.field) + 1;
                this.setState({ randomCell: row + '' + col, color: 'blue', play: false })
                this.timeout();
            })
        }
    }

    // Posting game result on server and fetching the whole list of winners
    saveResult() {
        let self = this;
        axios.post('https://starnavi-frontend-test-task.herokuapp.com/winners', {
            winner: this.state.winner,
            date: Date().substring(0, Date().indexOf('GMT'))
        })
            .then(function (response) {
                self.setState({ results: response.data })
            })
    }

    // Picking winner (whether someone reached score > 50% of field)
    winner() {
        if (this.state.computer >= Math.pow(this.state.field, 2) / 2) {
            this.setState({ winner: 'Computer', button: 'Play again', user: 0, computer: 0 }, () => {
                this.saveResult();
            })
        } else if (this.state.user >= Math.pow(this.state.field, 2) / 2) {
            this.setState({ winner: this.state.userName, button: 'Play again', user: 0, computer: 0 }, () => {
                this.saveResult();
            })
        } else {
            return '';
        }
    }

    render() {
        return (
            <div id="main">
                <div id="main-container">
                    <div id="controllers">
                        <FormControl>
                            <Select
                                native
                                value={this.state.mode}
                                onChange={this.handleChange}
                                inputProps={{
                                    name: 'mode',
                                    id: 'mode-picker',
                                }}
                                size="large"
                            >
                                {this.state.modes.map(item => {
                                    return <option key={item} value={item}>{item}</option>
                                })}
                            </Select>
                        </FormControl>
                        <TextField id="standard-basic" label="Enter Name" name="userName" value={this.state.userName} onChange={this.handleChange} style={{ width: '130px' }} />

                        {/* Change buttons */}
                        {(this.state.button === 'Play') ?
                            <Button name={this.state.button} disabled={(this.state.userName !== '') ? false : true} variant="contained" color="primary" size="small" onClick={this.play}>
                                {this.state.button}
                            </Button> :
                            <Button name={this.state.button} variant="contained" color="primary" size="small" onClick={this.restart.bind(this)}>
                                {this.state.button}
                            </Button>
                        }
                    </div>

                    {/* Winner choosen! */}
                    {(this.state.winner !== '') ? <h1 style={{ color: '#fff' }}>{this.state.winner} won</h1> : null}

                    <div id="field">
                        <table>
                            <tbody>
                                {this.state.cols.map((row) => {
                                    return <tr key={row}>{this.state.cols.map((col) => {
                                        // Checking whether random cell was set
                                        return (this.state.randomCell === (row + '' + col)) ? <td key={row + '' + col} data-picked="picked" style={{ backgroundColor: this.state.color }} onClick={this.check}></td> : <td key={row + '' + col} onClick={this.check}></td>
                                    })}</tr>
                                })}
                            </tbody>
                        </table>
                        <p>Computer: {this.state.computer}</p>
                        <p>User: {this.state.user}</p>
                    </div>
                </div>

                <div id="results">
                    {this.state.results.map((item) => {
                        return <h4 key={item.id}>Winner: {item.winner} ---- Date: {item.date}</h4>
                    })}
                </div>
            </div>
        )
    }
}

export default Field
