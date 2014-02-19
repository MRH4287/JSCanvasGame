using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace MapEditor.GUIElements
{
    class TileCommand : ContentControl
    {
        #region Dependency Property

        public static string GetText(DependencyObject obj)
        {
            return (string)obj.GetValue(TextProperty);
        }

        public static void SetText(DependencyObject obj, string value)
        {
            obj.SetValue(TextProperty, value);
        }

        // Using a DependencyProperty as the backing store for Text.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty TextProperty =
            DependencyProperty.RegisterAttached("Text", typeof(string), typeof(TileCommand), new PropertyMetadata(""));


        public static Visibility GetSelectionIndicatorVisible(DependencyObject obj)
        {
            return (Visibility)obj.GetValue(SelectionIndicatorVisibleProperty);
        }

        public static void SetSelectionIndicatorVisible(DependencyObject obj, Visibility value)
        {
            obj.SetValue(SelectionIndicatorVisibleProperty, value);
        }

        // Using a DependencyProperty as the backing store for SelectionIndicatorVisible.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty SelectionIndicatorVisibleProperty =
            DependencyProperty.RegisterAttached("SelectionIndicatorVisible", typeof(Visibility), typeof(TileCommand), new PropertyMetadata(Visibility.Collapsed));



        public static CommandState GetCommand(DependencyObject obj)
        {
            return (CommandState)obj.GetValue(CommandProperty);
        }

        public static void SetCommand(DependencyObject obj, CommandState value)
        {
            obj.SetValue(CommandProperty, value);
        }

        // Using a DependencyProperty as the backing store for Command.  This enables animation, styling, binding, etc...
        public static readonly DependencyProperty CommandProperty =
            DependencyProperty.RegisterAttached("Command", typeof(CommandState), typeof(TileCommand), new PropertyMetadata(CommandState.Select));


        #endregion

        public string Text
        {
            get
            {
                return GetText(this);
            }
            set
            {
                SetText(this, value);
            }
        }

        public bool Selected
        {
            get
            {
                return (GetSelectionIndicatorVisible(this) == System.Windows.Visibility.Visible);
            }
            set
            {
                SetSelectionIndicatorVisible(this, (value) ? Visibility.Visible : Visibility.Collapsed);
            }
        }

        public CommandState Command
        {
            get
            {
                return GetCommand(this);
            }
            set
            {
                SetCommand(this, value);
            }
        }


        public TileCommand()
        {
            this.Width = MapTile.GlobalSize;
            this.Height = MapTile.GlobalSize;

        }

    }
}
