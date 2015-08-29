using MapEditor.Elements;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MapEditor.GUIElements.Base
{
    interface IScriptedObject
    {
        Task<bool> prePaint(MapTile destination);

        void postPaint(MapTile destination);

        ElementDefinition ElementDefinition { get; }

    }
}
