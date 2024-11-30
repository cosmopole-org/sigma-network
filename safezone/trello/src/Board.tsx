import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';

export default function Board(props: { themeColor: any, board: any, onSelect: () => void }) {
    return (
        <Card elevation={0} style={{ backgroundColor: props.themeColor[100], width: window.innerWidth / 2 - 40, height: 210, margin: 8, borderRadius: 16 }}
            onClick={props.onSelect}>
            <CardActionArea>
                <CardMedia
                    component="img"
                    height="150"
                    image={props.board.prefs.backgroundImage}
                    alt="green iguana"
                    style={{ padding: 8, paddingBottom: 0, width: 'calc(100% - 16px)', borderRadius: 16 }}
                />
                <CardContent style={{ marginTop: -4 }}>
                    <Typography style={{ color: props.themeColor['activeText'] }} gutterBottom variant="h6" component="div">
                        {props.board.name}
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}
