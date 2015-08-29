using MapEditor.Elements;
using MapEditor.GUIElements.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Media.Imaging;

namespace MapEditor.GUIElements
{
    class TileTeleporter : TileImage
    {
        private static string TargetFile = null;
        private static string TargetTileID = null;
        private static string TargetDirection = null;

        private static bool Active = false;

        public TileTeleporter()
            : base()
        {
        }

        public TileTeleporter(ElementDefinition def)
            : base(def)
        {
            this.ImageSource = def.ImageSource;
        }

        public async override Task<bool> prePaint(MapTile destination)
        {
            if (Active)
            {
                return false;
            }
            Active = true;

            try
            {

                var file = await MapEditor.TextInput.Display("Insert Target File", "$(mapPath)");
                if (string.IsNullOrWhiteSpace(file))
                {
                    return false;
                }

                var id = await MapEditor.TextInput.Display("Insert Tile-ID", "");
                if (string.IsNullOrWhiteSpace(id))
                {
                    return false;
                }

                var direction = await MapEditor.TextInput.Display("Direction", "$(playerManager.moveDirection)");
                if (string.IsNullOrWhiteSpace(direction))
                {
                    return false;
                }

                TargetFile = file;
                TargetTileID = id;
                TargetDirection = direction;

                return await base.prePaint(destination);
            }
            finally
            {
                Active = false;
            }
        }

        public override void postPaint(MapTile destination)
        {
            postDelete(destination);

            string command = "teleport('"+ TargetFile + "','" + TargetTileID + "','" + TargetDirection + "')";
            destination.Tile.Events.Add(new KeyValuePair<string, string>("enter", command));

            base.postPaint(destination);
        }

        public override void postDelete(MapTile destination)
        {

            foreach (var item in destination.Tile.Events.Where(el => el.Value.Contains("teleport")).ToArray())
            {
                destination.Tile.Events.Remove(item);
            }

            base.postDelete(destination);
        }

    }
}
