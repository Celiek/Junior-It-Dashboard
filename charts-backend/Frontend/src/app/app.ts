import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {DemoChartComponent} from "./components/demo-chart/demo-chart";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
