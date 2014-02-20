﻿using MapEditor.Elements;
using MapEditor.GUIElements;
using MapEditor.GUIElements.Base;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace MapEditor
{
    /// <summary>
    /// The Class used for controlling the Map-Editor
    /// </summary>
    class MapController
    {
        /// <summary>
        /// The Element containing all MapTiles
        /// </summary>
        StackPanel MapHolder = null;
        /// <summary>
        /// The Element containing all Tiles (Command / Images / Prefabs)
        /// </summary>
        WrapPanel TileHolder = null;

        /// <summary>
        /// List of all Element-Definitions
        /// </summary>
        public Dictionary<string, ElementDefinition> Elements { get; private set; }

        /// <summary>
        /// List of all Prefabs
        /// </summary>
        public Dictionary<string, Prefab> Prefabs { get; private set; }

        /// <summary>
        /// Instance of the current selected Element
        /// </summary>
        public MapTile Selected { get; private set; }

        /// <summary>
        /// Instance of the current selected TileElement
        /// </summary>
        public Selectable SelectedTile { get; private set; }

        /// <summary>
        /// List of predefined Command Elements
        /// </summary>
        private LinkedList<TileCommand> CommandElements = new LinkedList<TileCommand>();

        /// <summary>
        /// The current State of the Editor
        /// </summary>
        private CommandState state = CommandState.Select;

        /// <summary>
        /// Is the MouseButton pressed?
        /// </summary>
        private bool isMouseDown = false;

        /// <summary>
        /// Creates a new MapController Instance
        /// </summary>
        /// <param name="holder">The MapTile Container</param>
        /// <param name="tileHolder">The Container for the TileElements</param>
        public MapController(StackPanel holder, WrapPanel tileHolder)
        {
            this.MapHolder = holder;
            this.TileHolder = tileHolder;

            foreach (var item in TileHolder.Children)
            {
                if (item is TileCommand)
                {
                    var element = (TileCommand)item;

                    element.MouseDown += (sender, e) =>
                        {
                            TileCommand commandElement = (TileCommand)sender;

                            if (SelectedTile != null)
                            {
                                SelectedTile.Selected = false;
                            }

                            commandElement.Selected = true;
                            SelectedTile = commandElement;

                            state = commandElement.Command;

                        };

                    CommandElements.AddLast(element);

                }

            }

        }


        /// <summary>
        /// Load the Config
        /// </summary>
        /// <param name="path">Path to load Config from</param>
        public void LoadConfig(string path, string prefabPath = null)
        {
            if (Directory.Exists(path))
            {
                // Load the ElementDefinitions
                FileInfo info = new FileInfo(path + "elements.json");

                var reader = info.OpenText();
                var content = reader.ReadToEnd();

                reader.Close();

                var elements = ElementDefinition.Create(content);

                Elements = elements.ToDictionary(el => el.ID);

                // Load Prefabs

                Prefabs = new Dictionary<string, Prefab>();

                if (prefabPath != null)
                {
                    DirectoryInfo dir = new DirectoryInfo(prefabPath);

                    foreach (var file in dir.GetFiles())
                    {
                        reader = file.OpenText();
                        content = reader.ReadToEnd();

                        reader.Close();

                        var prefab = Prefab.Create(content, Elements);

                        Prefabs[prefab.ID] = prefab;

                    }


                }



                // Clear all old Elements from the TileHolder
                this.TileHolder.Children.Clear();

                // Readd all CommandElemens
                foreach (var item in this.CommandElements)
                {
                    this.TileHolder.Children.Add(item);
                }

                // Add all Prefabs to the TileHolder
                foreach (var prefab in Prefabs)
                {
                    var tilePrefab = new TilePrefab(prefab.Value);

                    tilePrefab.MouseDown += tilePrefab_MouseDown;

                    this.TileHolder.Children.Add(tilePrefab);

                }



                // Add all ElementDefinitions to the TileHolder
                foreach (var item in Elements)
                {
                    var tileImage = new TileImage(item.Value);

                    tileImage.MouseDown += tileImage_MouseDown;

                    this.TileHolder.Children.Add(tileImage);
                }


            }



        }

        /// <summary>
        /// Loads the Map
        /// </summary>
        /// <param name="path">Path to the MapFile</param>
        public void LoadMap(string path)
        {
            if (File.Exists(path))
            {
                MapHolder.Children.Clear();

                FileInfo info = new FileInfo(path);
                var reader = info.OpenText();
                string content = reader.ReadToEnd();

                reader.Close();

                var map = Tile.Create(content, Elements);

                for (int y = 0; y < map.Count; y++)
                {
                    var row = map[y];

                    addRow(row, y);


                }
            }

        }


        /// <summary>
        /// Triggered when one <see cref="TilePrefab"/> was clicked
        /// </summary>
        /// <param name="sender">TilePrefab instance</param>
        /// <param name="e">Event Parameter</param>
        void tilePrefab_MouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (this.SelectedTile != null)
            {
                SelectedTile.Selected = false;
            }

            state = CommandState.PaintPrefab;

            SelectedTile = (TilePrefab)sender;
            SelectedTile.Selected = true;
        }

        /// <summary>
        /// Triggered when one <see cref="TileImage"/> was clicked
        /// </summary>
        /// <param name="sender">TileImage instance</param>
        /// <param name="e">Event Parameter</param>
        void tileImage_MouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (this.SelectedTile != null)
            {
                SelectedTile.Selected = false;
            }

            state = CommandState.Paint;

            SelectedTile = (TileImage)sender;
            SelectedTile.Selected = true;
        }


        /// <summary>
        /// Adds a Row of <see cref="Tile" /> instances to the Map 
        /// </summary>
        /// <param name="elements">List of <see cref="Tile"/> Instances</param>
        /// <param name="YIndex">The Current Y-Coordinate</param>
        public void addRow(IEnumerable<Tile> elements, int YIndex = 0)
        {
            var mapTileArray = elements.Select(el => MapTile.Create(el)).ToArray();

            for (int x = 0; x < mapTileArray.Length; x++)
            {
                var tile = mapTileArray[x];

                tile.MouseDown += tile_MouseDown;
                tile.MouseMove += tile_MouseMove;
                tile.MouseUp += tile_MouseUp;

                tile.X = x;
                tile.Y = YIndex;
            }


            addRow(mapTileArray);
        }


        /// <summary>
        /// Adds a Row of <see cref="MapTile"/> instances to the Map
        /// </summary>
        /// <param name="elements">List of <see cref="MapTile"/> instances</param>
        public void addRow(IEnumerable<MapTile> elements)
        {
            var container = getRowContainer();

            foreach (var item in elements)
            {
                container.Children.Add(item);
            }

            MapHolder.Children.Add(container);
        }



        /// <summary>
        /// Add a Row of blank MapTiles to the Map
        /// </summary>
        /// <param name="count">Ammount of Elements to add</param>
        public void addRow(int count = 10)
        {
            var container = getRowContainer();

            for (int i = 0; i < count; i++)
            {
                var tile = new MapTile();
                tile.Tile = new Tile();

                if (Elements != null)
                {
                    tile.BottomElement = Elements["grass"];
                }

                tile.MouseDown += tile_MouseDown;
                tile.MouseMove += tile_MouseMove;
                tile.MouseUp += tile_MouseUp;



                container.Children.Add(tile);
            }

            MapHolder.Children.Add(container);

        }

        /// <summary>
        /// Draw an element to the Map
        /// </summary>
        /// <param name="def">The <see cref="ElementDefinition"/> that should be set the field</param>
        /// <param name="destination">Field to apply the new ElementDefinition</param>
        private void draw(ElementDefinition def, MapTile destination)
        {
            switch (def.Level)
            {
                case ElementLevel.Bottom:
                    destination.BottomElement = def;
                    break;
                case ElementLevel.Middle:
                    destination.MiddleElement = def;
                    break;
                case ElementLevel.Top:
                    destination.TopElement = def;
                    break;
                default:
                    break;
            }
        }

        /// <summary>
        /// Draw a Prefab on the Map
        /// </summary>
        /// <param name="def">the Prefab Definition to draw</param>
        /// <param name="destination">The Position to draw</param>
        private void drawPrefab(Prefab def, MapTile destination)
        {
            var localX = destination.X;
            var localY = destination.Y;

            var map = getMapTileData();

            if (map[localY][localX] != destination)
            {
                throw new ArgumentException("The Desination and the Coordinates do not Match!");
            }

            foreach (var element in def.Elements)
            {
                var targetX = localX + element.OffsetX;
                var targetY = localY + element.OffsetY;

                if ((targetX < 0) || (targetY < 0) || (targetY > map.Count) || (targetX > map[targetY].Count))
                {
                    continue;
                }

                var targetElement = map[targetY][targetX];

                if (def.ClearOld)
                {
                    targetElement.Tile = element.Tile;
                }
                else
                {
                    var targetTile = targetElement.Tile;
                    var cloneTile = element.Tile;

                    if (!string.IsNullOrWhiteSpace(cloneTile.ID))
                    {
                        if (!string.IsNullOrWhiteSpace(targetTile.ID))
                        {
                            if (def.Overwrite)
                            {
                                targetTile.ID = cloneTile.ID;
                            }
                        }
                        else
                        {
                            targetTile.ID = cloneTile.ID;
                        }
                    }


                    if (!string.IsNullOrWhiteSpace(cloneTile.BottomElementID))
                    {
                        if (targetElement.BottomElement != null)
                        {
                            if (def.Overwrite)
                            {
                                targetElement.BottomElement = cloneTile[ElementLevel.Bottom];
                            }
                        }
                        else
                        {
                            targetElement.BottomElement = cloneTile[ElementLevel.Bottom];
                        }
                    }

                    if (!string.IsNullOrWhiteSpace(cloneTile.MiddleElementID))
                    {
                        if (targetElement.MiddleElement != null)
                        {
                            if (def.Overwrite)
                            {
                                targetElement.MiddleElement = cloneTile[ElementLevel.Middle];
                            }
                        }
                        else
                        {
                            targetElement.MiddleElement = cloneTile[ElementLevel.Middle];
                        }
                    }

                    if (!string.IsNullOrWhiteSpace(cloneTile.TopElementID))
                    {
                        if (targetElement.TopElement != null)
                        {
                            if (def.Overwrite)
                            {
                                targetElement.TopElement = cloneTile[ElementLevel.Top];
                            }
                        }
                        else
                        {
                            targetElement.TopElement = cloneTile[ElementLevel.Top];
                        }
                    }


                    if (cloneTile.Flags != null)
                    {
                        if ((targetTile.Flags != null) && (targetTile.Flags.Count > 0))
                        {
                            if (def.Overwrite)
                            {
                                targetTile.Flags = cloneTile.Flags;
                            }
                            else
                            {
                                foreach (var flag in cloneTile.Flags)
                                {
                                    if (!targetTile.Flags.Contains(flag))
                                    {
                                        targetTile.Flags.AddLast(flag);
                                    }
                                }
                            }
                        }
                        else
                        {
                            targetTile.Flags = cloneTile.Flags;
                        }
                    }


                    targetTile.Passable = targetTile.Passable || cloneTile.Passable;

                    targetTile.Speed = (new double[] { targetTile.Speed, cloneTile.Speed }).Min();

                    if (cloneTile.Events != null)
                    {
                        if ((targetTile.Events != null) && (targetTile.Events.Count > 0))
                        {
                            if (def.Overwrite)
                            {
                                targetTile.Events = cloneTile.Events;
                            }
                            else
                            {
                                foreach (var el in cloneTile.Events)
                                {
                                    if (!targetTile.Events.Any(a => a.Key == el.Key))
                                    {
                                        targetTile.Events.Add(el);
                                    }
                                }
                            }
                        }
                        else
                        {
                            targetTile.Events = cloneTile.Events;
                        }
                    }


                }


            }


        }


        /// <summary>
        /// Triggered when one <see cref="MapTile"/> was clicked
        /// </summary>
        /// <param name="sender">MapTile instance</param>
        /// <param name="e">Event Parameter</param>
        void tile_MouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            isMouseDown = true;

            MapTile source = (MapTile)sender;

            if (Selected != null)
            {
                Selected.Selected = false;
            }

            var old = Selected;
            Selected = source;

            execMouseEvent(Selected, old, true);
        }

        /// <summary>
        /// Execute the current selected Mouse Action
        /// </summary>
        /// <param name="source">Destination of Mouse Action</param>
        /// <param name="lastSelected">The Element that was selected before the current</param>
        /// <param name="click">Was the Event Triggered by the MouseDown Event</param>
        private void execMouseEvent(MapTile source, MapTile lastSelected, bool click = false)
        {
            if (source == null)
            {
                throw new ArgumentNullException();
            }



            Selected = source;
            Selected.Selected = true;


            if ((state == CommandState.Paint) && (this.SelectedTile != null) && (this.SelectedTile is TileImage))
            {
                draw((SelectedTile as TileImage).Element, source);
            }
            else if (state == CommandState.ClearAll)
            {
                source.BottomElement = null;
                source.TopElement = null;
                source.MiddleElement = null;
            }
            else if (state == CommandState.ClearBottom)
            {
                source.BottomElement = null;
            }
            else if (state == CommandState.ClearMiddle)
            {
                source.MiddleElement = null;
            }
            else if (state == CommandState.ClearTop)
            {
                source.TopElement = null;
            }
            else if ((state == CommandState.PaintPrefab) && (this.SelectedTile != null) && (this.SelectedTile is TilePrefab))
            {
                drawPrefab((SelectedTile as TilePrefab).Element, source);
            }
            else if ((state == CommandState.Select) && (source == lastSelected) && click)
            {
                Task delayTask = new Task(() =>
                {
                    System.Threading.Thread.Sleep(100);

                    MessageBox.Show("Some Information ...");

                });

                delayTask.Start();


            }
        }

        /// <summary>
        /// The Mouse was released
        /// </summary>
        /// <param name="sender">MapTile Instance</param>
        /// <param name="e">Event Arguments</param>
        void tile_MouseUp(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            this.isMouseDown = false;
        }

        /// <summary>
        /// The Mouse was moved
        /// </summary>
        /// <param name="sender">MapTile Instance</param>
        /// <param name="e">Event Arguments</param>
        void tile_MouseMove(object sender, System.Windows.Input.MouseEventArgs e)
        {
            if (isMouseDown)
            {
                MapTile source = (MapTile)sender;

                if (Selected != null)
                {
                    Selected.Selected = false;
                }

                var old = Selected;
                Selected = source;

                execMouseEvent(Selected, old);
            }
        }


        /// <summary>
        /// Serializes the current Map. Returned JSON string
        /// </summary>
        /// <returns>JSON serialized MapFile</returns>
        public string Serialize()
        {
            return Data.JSON.JSONSerializer.serialize<List<List<Tile>>>(getMapData());
        }

        /// <summary>
        /// Converts the Map into a Map-Array
        /// </summary>
        /// <returns></returns>
        private List<List<Tile>> getMapData()
        {
            var input = getMapTileData();

            var result = input.Select(el => new List<Tile>(el.Select(innerEl => innerEl.Tile))).ToList();

            return result;
        }

        /// <summary>
        /// Converts the Map into a Map-Array
        /// </summary>
        /// <returns></returns>
        private List<List<MapTile>> getMapTileData()
        {
            List<List<MapTile>> mapData = new List<List<MapTile>>();

            foreach (var row in MapHolder.Children)
            {
                if (row is StackPanel)
                {
                    var rowPanel = ((StackPanel)row).Children;
                    List<MapTile> tileList = new List<MapTile>(rowPanel.Count);

                    foreach (var tile in rowPanel)
                    {
                        if (tile is MapTile)
                        {
                            tileList.Add((MapTile)tile);
                        }
                    }

                    mapData.Add(tileList);
                }
            }

            return mapData;
        }


        /// <summary>
        /// Create a new RowContainer
        /// </summary>
        /// <returns>StackPanel Instance</returns>
        public StackPanel getRowContainer()
        {
            StackPanel panel = new StackPanel();
            panel.HorizontalAlignment = System.Windows.HorizontalAlignment.Left;
            panel.Orientation = Orientation.Horizontal;
            panel.Background = Brushes.Blue;

            return panel;
        }


        /// <summary>
        /// Get the absolute URI from a relative Path
        /// </summary>
        /// <param name="path">Relative Path</param>
        /// <returns>Absolute URI</returns>
        public static Uri GetAbsoluteUri(string path)
        {
            var execPath = System.Reflection.Assembly.GetExecutingAssembly().Location;

            FileInfo fileInfo = new FileInfo(execPath);

            var loadPath = fileInfo.DirectoryName;

            // Sets the Path to the development Path while in Design time
            if (loadPath.Contains("Designer"))
            {
                loadPath = @"D:\Visual Studio 2010\Projects\SpriteGame";
            }
            return new Uri(loadPath + "\\" + path, UriKind.Absolute);

        }


        /// <summary>
        /// Add a new DataBinding
        /// </summary>
        /// <param name="localVar">Local Property to Bind</param>
        /// <param name="dp">Binding to use</param>
        public static void Bind(ContentControl target, string localVar, DependencyProperty dp)
        {
            Binding binding = new Binding(localVar);
            binding.Source = target;
            target.SetBinding(dp, binding);
        }

    }
}
