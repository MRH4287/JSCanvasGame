using MapEditor.Elements;
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
    public class MapController
    {
        /// <summary>
        /// The Element containing all MapTiles
        /// </summary>
        StackPanel MapHolder = null;
        /// <summary>
        /// The Element containing all Tiles
        /// </summary>
        WrapPanel TileHolder = null;

        /// <summary>
        /// The Element containing the CommandTiles
        /// </summary>
        WrapPanel CommandTileHolder = null;

        /// <summary>
        /// The Element containing the PrefabTiles
        /// </summary>
        WrapPanel PrefabTileHolder = null;

        /// <summary>
        /// The Element containing scripted Tiles
        /// </summary>
        WrapPanel ScriptedTileHolder = null;

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
        /// The List of all MapTiles where the Preview is shown
        /// </summary>
        private LinkedList<MapTile> prefabPreviewShown = new LinkedList<MapTile>();

        /// <summary>
        /// Creates a new MapController Instance
        /// </summary>
        /// <param name="holder">The MapTile Container</param>
        /// <param name="tileHolder">The Container for the TileElements</param>
        public MapController(StackPanel holder, WrapPanel tileHolder, WrapPanel commandTileHolder, WrapPanel prefabTileHolder, WrapPanel sciptedTileHolder)
        {
            this.MapHolder = holder;
            this.TileHolder = tileHolder;
            this.CommandTileHolder = commandTileHolder;
            this.PrefabTileHolder = prefabTileHolder;
            this.ScriptedTileHolder = sciptedTileHolder;

            foreach (var item in CommandTileHolder.Children)
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

                Dictionary<string, NPC> npcData = null;

                if (File.Exists(path + "npc/npcData.json"))
                {
                    info = new FileInfo(path + "npc/npcData.json");

                    reader = info.OpenText();
                    content = reader.ReadToEnd();

                    reader.Close();

                    List<NPC> npcList = Data.JSON.JSONSerializer.deserialize<List<NPC>>(content);

                    npcData = npcList.ToDictionary(el => el.ID);

                }


                // Clear all old Elements from the TileHolder
                this.CommandTileHolder.Children.Clear();
                this.PrefabTileHolder.Children.Clear();
                this.TileHolder.Children.Clear();
                this.ScriptedTileHolder.Children.Clear();

                // Read all CommandElemens
                foreach (var item in this.CommandElements)
                {
                    this.CommandTileHolder.Children.Add(item);
                }

                // Add all Prefabs to the TileHolder
                foreach (var prefab in Prefabs)
                {
                    var tilePrefab = new TilePrefab(prefab.Value);

                    tilePrefab.MouseDown += tilePrefab_MouseDown;

                    this.PrefabTileHolder.Children.Add(tilePrefab);

                }

                // Add all ElementDefinitions to the TileHolder
                foreach (var item in Elements)
                {
                    var tileImage = new TileImage(item.Value);

                    tileImage.MouseDown += tileImage_MouseDown;

                    this.TileHolder.Children.Add(tileImage);
                }

                // Add Teleporter to ScriptedTileHolder
                ElementDefinition teleporter = (Elements.ContainsKey("Teleport") ? Elements["Teleport"] : null);
                if (teleporter != null)
                {
                    var tileTeleporter = new TileTeleporter(teleporter);

                    tileTeleporter.MouseDown += tileImage_MouseDown;

                    this.ScriptedTileHolder.Children.Add(tileTeleporter);
                }


                // Add NPCs to ScriptedTileHolder

                if (npcData != null)
                {
                    ElementDefinition npcSpawnDef = (Elements.ContainsKey("NPCSpawn") ? Elements["NPCSpawn"] : null);
                    if (npcSpawnDef != null)
                    {
                        foreach (var item in npcData)
                        {
                            var tileNPC = new TileNPC(item.Value, npcSpawnDef);

                            tileNPC.MouseDown += tileScripted_MouseDown;

                            this.ScriptedTileHolder.Children.Add(tileNPC);
                        }
                    }
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
        /// Triggered when one <see cref="IScriptedObject"/> was clicked
        /// </summary>
        /// <param name="sender">TileNPC instance</param>
        /// <param name="e">Event Parameter</param>
        void tileScripted_MouseDown(object sender, System.Windows.Input.MouseButtonEventArgs e)
        {
            if (this.SelectedTile != null)
            {
                SelectedTile.Selected = false;
            }

            state = CommandState.PaintScriptedElement;

            SelectedTile = (Selectable)sender;
            SelectedTile.Selected = true;
        }


        public void createMap(int width, int height)
        {
            if (width * height > 3025)
            {
                MessageBox.Show("Map is too big! Max allowed number of Tiles: 3025");
                return;
            }

            MapHolder.Children.Clear();

            for (int y = 0; y < height; y++)
            {
                LinkedList<Tile> tiles = new LinkedList<Tile>();

                for (int x = 0; x < width; x++)
                {
                    var tile = new Tile();
                    tile[ElementLevel.Bottom] = Elements["grass"];

                    tiles.AddLast(tile);
                }

                addRow(tiles, y);
            }
        }

        public void changeMapSize(int width, int height)
        {
            bool different = false;
            different |= height < MapHolder.Children.Count;

            if (MapHolder.Children.Count > 0)
            {
                different |= width < ((StackPanel)MapHolder.Children[0]).Children.Count;
            }


            Action work = () =>
            {
                var heightDiff = height - MapHolder.Children.Count;
                if (heightDiff < 0)
                {
                    heightDiff *= -1;
                    MapHolder.Children.RemoveRange(height, heightDiff);
                }

                for (int y = 0; y < height; y++)
                {
                    StackPanel container = null;
                    if (y >= MapHolder.Children.Count)
                    {
                        if (MapHolder.Children.Count == y)
                        {
                            container = getRowContainer();
                            MapHolder.Children.Add(container);
                        }
                        else
                        {
                            continue;
                        }
                    }
                    else
                    {
                        container = MapHolder.Children[y] as StackPanel;
                    }


                    var widthDiff = width - container.Children.Count;
                    if (widthDiff < 0)
                    {
                        widthDiff *= -1;
                        container.Children.RemoveRange(width, widthDiff);

                    }
                    else
                    {
                        for (int x = 0; x < widthDiff; x++)
                        {
                            var tile = new Tile();
                            tile[ElementLevel.Bottom] = Elements["grass"];

                            addElement(tile, y);
                        }
                    }
                }



            };


            if (different)
            {
                var result = MessageBox.Show("The selected Size is smaller than the current. Continue?", "Warning", MessageBoxButton.YesNo);
                if (result == MessageBoxResult.Yes)
                {
                    work();
                }
            }
            else
            {
                work();
            }



        }


        /// <summary>
        /// Add an <see cref="Tile"/> to a specific Row
        /// </summary>
        /// <param name="input">Tile Input</param>
        /// <param name="row">The row to add</param>
        public void addElement(Tile input, int row)
        {
            StackPanel container = null;
            if (row >= MapHolder.Children.Count)
            {
                if (MapHolder.Children.Count == row)
                {
                    container = getRowContainer();
                    MapHolder.Children.Add(container);
                }
                else
                {
                    throw new ArgumentOutOfRangeException("row", "The Line with this Index was not found!");
                }
            }
            else
            {
                container = MapHolder.Children[row] as StackPanel;
            }

            if (container == null)
            {
                throw new Exception();
            }

            var mapTile = MapTile.Create(input);

            mapTile.MouseDown += tile_MouseDown;
            mapTile.MouseMove += tile_MouseMove;
            mapTile.MouseUp += tile_MouseUp;

            mapTile.X = container.Children.Count + 1;
            mapTile.Y = row + 1;

            container.Children.Add(mapTile);
        }



        /// <summary>
        /// Adds a Row of <see cref="Tile" /> instances to the Map 
        /// </summary>
        /// <param name="elements">List of <see cref="Tile"/> Instances</param>
        /// <param name="YIndex">The Current Y-Coordinate</param>
        public void addRow(IEnumerable<Tile> elements, int YIndex = 0)
        {
            var elementList = elements.ToArray();
            for (int x = 0; x < elementList.Length; x++)
            {
                addElement(elementList[x], YIndex);
            }

        }




        /// <summary>
        /// Draw an element to the Map
        /// </summary>
        /// <param name="def">The <see cref="ElementDefinition"/> that should be set the field</param>
        /// <param name="destination">Field to apply the new ElementDefinition</param>
        /// <param name="drawGhost">Only draw the Ghost Image</param>
        private void draw(ElementDefinition def, MapTile destination, TileElement element, bool drawGhost = false)
        {
            if (!drawGhost)
            {
                switch (def.Level)
                {
                    case ElementLevel.Bottom:
                        destination.BottomElement = def;
                        destination.BottomTile = element;
                        break;
                    case ElementLevel.Middle:
                        destination.MiddleElement = def;
                        destination.MiddleTile = element;
                        break;
                    case ElementLevel.Top:
                        destination.TopElement = def;
                        destination.TopTile = element;
                        break;
                    default:
                        break;
                }
            }
            else
            {
                this.prefabPreviewShown.AddLast(destination);

                switch (def.Level)
                {
                    case ElementLevel.Bottom:
                        destination.BottomGhostLayerImage = def.ImageSource;
                        break;
                    case ElementLevel.Middle:
                        destination.MiddleGhostLayerImage = def.ImageSource;
                        break;
                    case ElementLevel.Top:
                        destination.TopGhostLayerImage = def.ImageSource;
                        break;
                    default:
                        break;
                }
            }
        }

        /// <summary>
        /// Draw a Prefab on the Map
        /// </summary>
        /// <param name="def">the Prefab Definition to draw</param>
        /// <param name="destination">The Position to draw</param>
        /// <param name="drawGhost">Draw only the Ghost Image</param>
        private void drawPrefab(Prefab def, MapTile destination, bool drawGhost = false)
        {
            var localX = destination.X - 1;
            var localY = destination.Y - 1;

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
                if (targetElement == null)
                {
                    continue;
                }

                if (drawGhost)
                {
                    this.prefabPreviewShown.AddLast(targetElement);
                }

                if (def.ClearOld)
                {
                    // Don't overwrite Tile if in Ghost Mode
                    if (!drawGhost)
                    {
                        targetElement.Tile = element.Tile;

                        targetElement.BottomTile = null;
                        targetElement.MiddleTile = null;
                        targetElement.TopTile = null;

                    }
                    else
                    {
                        // Do something ... :/
                    }
                }
                else
                {
                    var targetTile = targetElement.Tile;
                    var cloneTile = element.Tile;

                    if (!drawGhost && !string.IsNullOrWhiteSpace(cloneTile.ID))
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
                                if (!drawGhost)
                                {
                                    targetElement.BottomElement = cloneTile[ElementLevel.Bottom];

                                    targetElement.BottomTile = null;
                                }
                                else
                                {
                                    targetElement.BottomGhostLayerImage = cloneTile[ElementLevel.Bottom].ImageSource;
                                }
                            }
                        }
                        else
                        {
                            if (!drawGhost)
                            {
                                targetElement.BottomElement = cloneTile[ElementLevel.Bottom];

                                targetElement.BottomTile = null;
                            }
                            else
                            {
                                targetElement.BottomGhostLayerImage = cloneTile[ElementLevel.Bottom].ImageSource;
                            }
                        }
                    }

                    if (!string.IsNullOrWhiteSpace(cloneTile.MiddleElementID))
                    {
                        if (targetElement.MiddleElement != null)
                        {
                            if (def.Overwrite)
                            {
                                if (!drawGhost)
                                {
                                    targetElement.MiddleElement = cloneTile[ElementLevel.Middle];

                                    targetElement.MiddleTile = null;
                                }
                                else
                                {
                                    targetElement.MiddleGhostLayerImage = cloneTile[ElementLevel.Middle].ImageSource;
                                }
                            }
                        }
                        else
                        {
                            if (!drawGhost)
                            {
                                targetElement.MiddleElement = cloneTile[ElementLevel.Middle];

                                targetElement.MiddleTile = null;
                            }
                            else
                            {
                                targetElement.MiddleGhostLayerImage = cloneTile[ElementLevel.Middle].ImageSource;
                            }
                        }
                    }

                    if (!string.IsNullOrWhiteSpace(cloneTile.TopElementID))
                    {
                        if (targetElement.TopElement != null)
                        {
                            if (def.Overwrite)
                            {
                                if (!drawGhost)
                                {
                                    targetElement.TopElement = cloneTile[ElementLevel.Top];

                                    targetElement.TopTile = null;
                                }
                                else
                                {
                                    targetElement.TopGhostLayerImage = cloneTile[ElementLevel.Top].ImageSource;
                                }
                            }
                        }
                        else
                        {
                            if (!drawGhost)
                            {
                                targetElement.TopElement = cloneTile[ElementLevel.Top];

                                targetElement.TopTile = null;
                            }
                            else
                            {
                                targetElement.TopGhostLayerImage = cloneTile[ElementLevel.Top].ImageSource;
                            }
                        }
                    }


                    if (!drawGhost && cloneTile.Flags != null)
                    {
                        if ((targetTile != null) && (targetTile.Flags != null) && (targetTile.Flags.Count > 0))
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
                                        targetTile.Flags.Add(flag);
                                    }
                                }
                            }
                        }
                        else if (targetTile != null)
                        {
                            targetTile.Flags = cloneTile.Flags;
                        }
                    }

                    if (!drawGhost && targetTile != null)
                    {

                        targetTile.Passable = cloneTile.Passable;

                        targetTile.Speed = (new double[] { targetTile.Speed, cloneTile.Speed }).Min();

                        if (cloneTile.Events != null)
                        {
                            if ((targetTile != null) && (targetTile.Events != null) && (targetTile.Events.Count > 0))
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
                            else if (targetTile != null)
                            {
                                targetTile.Events = cloneTile.Events;
                            }
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
        private async void execMouseEvent(MapTile source, MapTile lastSelected, bool click = false)
        {
            if (source == null)
            {
                throw new ArgumentNullException();
            }



            Selected = source;
            Selected.Selected = true;


            if ((state == CommandState.Paint) && (this.SelectedTile != null) && (this.SelectedTile is TileImage))
            {
                var element = (SelectedTile as TileImage);
                if (await element.prePaint(source))
                {
                    draw(element.Element, source, element);
                    element.postPaint(source);
                }
            }
            else if (state == CommandState.ClearAll)
            {
                source.BottomElement = null;
                source.TopElement = null;
                source.MiddleElement = null;
                source.BottomTile = null;
                source.TopTile = null;
                source.MiddleTile = null;
            }
            else if (state == CommandState.ClearBottom)
            {
                source.BottomElement = null;
                source.BottomTile = null;
            }
            else if (state == CommandState.ClearMiddle)
            {
                source.MiddleElement = null;
                source.MiddleTile = null;
            }
            else if (state == CommandState.ClearTop)
            {
                source.TopElement = null;
                source.TopTile = null;
            }
            else if ((state == CommandState.PaintPrefab) && (this.SelectedTile != null) && (this.SelectedTile is TilePrefab))
            {
                var element = (SelectedTile as TilePrefab);
                if (await element.prePaint(source))
                {
                     drawPrefab((SelectedTile as TilePrefab).Element, source);
                    element.postPaint(source);
                }
            }
            else if ((state == CommandState.PaintScriptedElement) && (this.SelectedTile != null) && (this.SelectedTile is IScriptedObject))
            {
                var element = (SelectedTile as IScriptedObject);
                if (await element.prePaint(source))
                {
                    draw(element.ElementDefinition, source, SelectedTile as TileElement);
                    element.postPaint(source);
                }

            }
            else if ((state == CommandState.Select) && (source == lastSelected) && click)
            {
                var editor = new TileEdit(source);
                editor.Show();

                editor.Focus();


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
            if (this.prefabPreviewShown.Count > 0)
            {
                foreach (var item in this.prefabPreviewShown)
                {
                    item.ClearGhostImage();
                }
                this.prefabPreviewShown.Clear();
            }

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
            if ((state == CommandState.Paint) && (this.SelectedTile != null) && (this.SelectedTile is TileImage))
            {
                draw((SelectedTile as TileImage).Element, (MapTile)sender, null, true);
            }
            else if ((state == CommandState.PaintPrefab) && (this.SelectedTile != null) && (this.SelectedTile is TilePrefab))
            {
                drawPrefab((SelectedTile as TilePrefab).Element, (MapTile)sender, true);
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
                loadPath = @"M:\Visual Studio 2010\Projects\SpriteGame";
            }
            return new Uri(loadPath + "\\" + path, UriKind.Absolute);

        }


        /// <summary>
        /// Add a new DataBinding
        /// </summary>
        /// <param name="target">The Target of the Binding</param>
        /// <param name="localVar">Local Property to Bind</param>
        /// <param name="dp">Binding to use</param>
        public static void Bind(ContentControl target, string localVar, DependencyProperty dp)
        {
            Bind(target, target, localVar, dp);
        }

        /// <summary>
        /// Add a new DataBinding
        /// </summary>
        /// <param name="target">The Target og the binding</param>
        /// <param name="bindingSource">The source of the Binding</param>
        /// <param name="localVar">Local Property to Bind</param>
        /// <param name="dp">Binding to use</param>
        public static void Bind(ContentControl target, object bindingSource, string localVar, DependencyProperty dp)
        {
            Binding binding = new Binding(localVar);
            binding.Source = bindingSource;
            target.SetBinding(dp, binding);
        }

    }
}
